import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { apiDetail, apiListResponse as apiList, jsonResponse } from './fixtures.js';

vi.mock('../components/MapView.jsx', () => ({ default: () => <div data-testid="map" /> }));

let routes;
beforeEach(() => {
  routes = {};
  vi.stubGlobal('fetch', vi.fn((url, init = {}) => {
    const path = new URL(url).pathname.replace('/Prod', '');
    const key = `${init.method || 'GET'} ${path}`;
    const handler = routes[key];
    if (!handler) return jsonResponse({ message: `no route ${key}` }, 404);
    return handler(init);
  }));
});
afterEach(() => vi.unstubAllGlobals());

const listOk = () => (routes['GET /sources'] = () => jsonResponse(apiList));
const callsTo = (method, suffix) => fetch.mock.calls.filter(([u, i]) => (i?.method || 'GET') === method && u.endsWith(suffix));

describe('dashboard', () => {
  it('shows loading, then the list ranked by score with provisional notice', async () => {
    listOk();
    render(<App />);
    expect(screen.getByText(/Loading sources/)).toBeInTheDocument();
    const items = await screen.findAllByRole('listitem');
    const names = items.map((li) => within(li).queryByText(/Sample Source \d+/)?.textContent).filter(Boolean);
    expect(names).toEqual(['Sample Source 02', 'Sample Source 01', 'Sample Source 03']);
    expect(screen.getByText(/Groundwater trends are provisional and unverified/)).toBeInTheDocument();
    expect(screen.getByText(/does not predict when a pump will fail/)).toBeInTheDocument();
    expect(await screen.findByTestId('map')).toBeInTheDocument(); // map chunk is lazy-loaded
  });

  it('filters by priority chip and clears the filter', async () => {
    listOk();
    render(<App />);
    await screen.findByText('Sample Source 02');
    await userEvent.click(screen.getByRole('button', { name: /1 High/ }));
    expect(screen.queryByText('Sample Source 01')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 sources')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Sample Source 01')).toBeInTheDocument();
  });

  it('selects a source and shows the detail from the API once', async () => {
    listOk();
    routes['GET /sources/DEMO-SRC-002'] = () => jsonResponse(apiDetail);
    render(<App />);
    await userEvent.click((await screen.findByText('Sample Source 02')).closest('button'));
    expect(await screen.findByText('Groundwater Trend')).toBeInTheDocument();
    expect(screen.getByText('0.249')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Sample Source 01').closest('button'));
    await userEvent.click(screen.getByText('Sample Source 02').closest('button'));
    await waitFor(() => expect(screen.getByText('0.249')).toBeInTheDocument());
    expect(callsTo('GET', '/sources/DEMO-SRC-002')).toHaveLength(1);
  });

  it('shows an error with retry when the API is unreachable', async () => {
    routes['GET /sources'] = () => Promise.reject(new TypeError('Failed to fetch'));
    render(<App />);
    expect(await screen.findByText("Can't reach the WellWatch API")).toBeInTheDocument();
    listOk();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Sample Source 02')).toBeInTheDocument();
  });

  it('asks for a token on 401 and retries with it', async () => {
    routes['GET /sources'] = (init) =>
      init.headers.Authorization === 'Bearer secret' ? jsonResponse(apiList) : jsonResponse({ message: 'Unauthorized' }, 401);
    render(<App />);
    await screen.findByText('An access token is required');
    await userEvent.type(screen.getByLabelText('Access token'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Use token' }));
    expect(await screen.findByText('Sample Source 02')).toBeInTheDocument();
  });

  it('shows empty and malformed-response states', async () => {
    routes['GET /sources'] = () => jsonResponse([]);
    const { unmount } = render(<App />);
    expect(await screen.findByText('No sources yet')).toBeInTheDocument();
    unmount();
    routes['GET /sources'] = () => jsonResponse({ unexpected: true });
    render(<App />);
    expect(await screen.findByText('Unexpected reply from the API')).toBeInTheDocument();
  });

  it('keeps the list usable if the detail request fails', async () => {
    listOk();
    routes['GET /sources/DEMO-SRC-002'] = () => jsonResponse({ message: 'boom' }, 500);
    render(<App />);
    await userEvent.click((await screen.findByText('Sample Source 02')).closest('button'));
    expect(await screen.findByText('The server had a problem')).toBeInTheDocument();
    expect(screen.getAllByText(/2 low-yield reports/).length).toBeGreaterThan(0);
  });
});

describe('report form', () => {
  async function openForm() {
    listOk();
    render(<App />);
    await screen.findByText('Sample Source 02');
    await userEvent.click(screen.getByRole('button', { name: 'Report observation' }));
    return screen.getByRole('dialog');
  }

  it('validates before sending anything', async () => {
    const dialog = await openForm();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Submit report' }));
    expect(within(dialog).getByText('Choose the water source you inspected.')).toBeInTheDocument();
    expect(within(dialog).getByText('Select how much water the source gives.')).toBeInTheDocument();
    expect(callsTo('POST', '/reports')).toHaveLength(0);
  });

  it('submits the contract payload once and reports success only after a 2xx', async () => {
    let resolve;
    routes['POST /reports'] = () => new Promise((r) => (resolve = r));
    const dialog = await openForm();
    await userEvent.selectOptions(within(dialog).getByLabelText('Water source'), 'DEMO-SRC-001');
    await userEvent.click(within(dialog).getByLabelText('Low flow'));
    const submit = within(dialog).getByRole('button', { name: 'Submit report' });
    await userEvent.dblClick(submit);
    expect(callsTo('POST', '/reports')).toHaveLength(1);
    expect(screen.queryByText('Report saved')).not.toBeInTheDocument();
    resolve(new Response(JSON.stringify({ score: 0.7, level: 'High' }), { status: 201 }));
    expect(await screen.findByText('Report saved')).toBeInTheDocument();
    const body = JSON.parse(callsTo('POST', '/reports')[0][1].body);
    expect(body).toMatchObject({ source_id: 'DEMO-SRC-001', yield_level: 'low', failure_flag: false });
    expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await waitFor(() => expect(callsTo('GET', '/sources').length).toBeGreaterThan(1)); // list refreshed
  });

  it('keeps the input and asks for a token on 401', async () => {
    routes['POST /reports'] = () => jsonResponse({ message: 'Unauthorized' }, 401);
    const dialog = await openForm();
    await userEvent.selectOptions(within(dialog).getByLabelText('Water source'), 'DEMO-SRC-001');
    await userEvent.click(within(dialog).getByLabelText('No water'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Submit report' }));
    expect(await within(dialog).findByText('An access token is required')).toBeInTheDocument();
    expect(within(dialog).queryByText('Report saved')).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Water source')).toHaveValue('DEMO-SRC-001');
    expect(within(dialog).getByLabelText('No water')).toBeChecked();
  });

  it('shows a server error without claiming success', async () => {
    routes['POST /reports'] = () => jsonResponse({ message: 'down' }, 500);
    const dialog = await openForm();
    await userEvent.selectOptions(within(dialog).getByLabelText('Water source'), 'DEMO-SRC-001');
    await userEvent.click(within(dialog).getByLabelText('Normal flow'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Submit report' }));
    expect(await within(dialog).findByText('The server had a problem')).toBeInTheDocument();
    expect(screen.queryByText('Report saved')).not.toBeInTheDocument();
  });
});

describe('inspection planner & water access impact', () => {
  it('renders Plan This Week\'s Inspections and selects top sources', async () => {
    listOk();
    render(<App />);
    expect(await screen.findByText("Plan This Week's Inspections")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export Plan CSV' })).toBeInTheDocument();
    const capacityInput = screen.getByLabelText(/Capacity/i);
    expect(capacityInput).toHaveValue(5);
  });

  it('displays Water Access Impact inside source details', async () => {
    listOk();
    routes['GET /sources/DEMO-SRC-002'] = () => jsonResponse(apiDetail);
    render(<App />);
    await userEvent.click((await screen.findByText('Sample Source 02')).closest('button'));
    const impactSection = await screen.findByRole('region', { name: 'Water access impact' });
    expect(impactSection).toBeInTheDocument();
    expect(within(impactSection).getByText('Households served')).toBeInTheDocument();
    expect(within(impactSection).getByText('120')).toBeInTheDocument();
    expect(within(impactSection).getAllByText('Data not available').length).toBeGreaterThan(0);
    expect(screen.getByText(/Community impact indicates how many people may depend on them/)).toBeInTheDocument();
  });
});
