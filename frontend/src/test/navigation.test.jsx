import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { apiListResponse as apiList, jsonResponse } from './fixtures.js';

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
  routes['GET /sources'] = () => jsonResponse(apiList);
});
afterEach(() => vi.unstubAllGlobals());

describe('navigation and view switching', () => {
  it('switches to Methodology tab and displays pipeline details', async () => {
    render(<App />);
    await screen.findByText('Village 02');

    await userEvent.click(screen.getByRole('button', { name: 'Data & Methodology' }));
    expect(await screen.findByText('How WellWatch Works: Data & Methodology')).toBeInTheDocument();
    expect(screen.getByText(/The 4-Stage Intelligence Pipeline/)).toBeInTheDocument();
    expect(screen.getByText(/Not a Water Safety Certification/)).toBeInTheDocument();
  });

  it('switches to Problem & Impact tab and displays operational context', async () => {
    render(<App />);
    await screen.findByText('Village 02');

    await userEvent.click(screen.getByRole('button', { name: 'Problem & Impact' }));
    expect(await screen.findByText('Problem Statement & Operational Impact')).toBeInTheDocument();
    expect(screen.getByText(/Reactive Maintenance Leaves Villages Stranded/)).toBeInTheDocument();
    expect(screen.getByText(/District Water Engineer/)).toBeInTheDocument();
  });

  it('toggles between Card and Table view modes on Dashboard', async () => {
    render(<App />);
    await screen.findByText('Village 02');

    const tableBtn = screen.getByRole('button', { name: 'Table' });
    await userEvent.click(tableBtn);

    expect(screen.getByRole('table', { name: /Water source inspection table/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cards' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cards' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('sorts sources by village name ascending', async () => {
    render(<App />);
    await screen.findByText('Village 02');

    const sortSelect = screen.getByLabelText('Sort by');
    await userEvent.selectOptions(sortSelect, 'village_asc');

    const items = await screen.findAllByRole('listitem');
    const names = items
      .map((li) => li.querySelector('.source-name')?.textContent)
      .filter(Boolean);
    expect(names).toEqual(['Village 01', 'Village 02', 'Village 03']);
  });
});
