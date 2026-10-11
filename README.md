# WellWatch — Water Source Inspection Prioritization

## Overview

WellWatch is a web-based decision-support platform designed to help field teams prioritize inspections of village water sources. It organizes water-source information into a ranked dashboard, enabling teams to identify which sources should receive attention first based on available inspection-priority scores, contributing factors, and groundwater trend information.

The platform combines an interactive map, source-level details, filtering capabilities, and a report-submission interface in one dashboard. Its goal is to make inspection planning more organized, transparent, and data-driven.

**WellWatch is an inspection-prioritization tool, not a pump-failure prediction system.** Its priority scores are heuristics intended to support inspection planning, not verified probabilities of equipment failure.

The current demonstration uses synthetic source records and provisional groundwater trends. These limitations are communicated throughout the application.

## Problem Statement

Village water sources require regular monitoring and inspection, but field teams may have limited time and resources to visit every source at once. Without an organized view of source information and inspection priorities, deciding where to focus attention first can be difficult.

WellWatch addresses this challenge by bringing source records, inspection-priority rankings, groundwater trend information, and field reports into a unified interface.

## Proposed Solution

WellWatch provides a centralized dashboard that allows users to:

- View water sources ranked by inspection priority.
- Identify High, Medium, and Low priority sources.
- Understand the reasons and factors contributing to each available priority score.
- Locate sources on an interactive map.
- Examine source-specific information and groundwater trends.
- Filter sources by priority, district, and text search.
- Submit reports through a structured form.
- Review recent reports and relevant source information when provided by the backend.

The interface displays missing scores, priority levels, or reasons as unavailable rather than generating unsupported information.

## Key Features

### 1. Inspection-Priority Dashboard

Displays available water sources with their priority levels, scores, and plain-language explanations. This helps field teams organize inspection visits based on the information currently available.

### 2. Interactive Water Source Map

Visualizes water sources geographically so users can explore their locations and compare them with the ranked inspection list.

The application supports MapLibre with Amazon Location Service when configured, and OpenStreetMap as the alternative basemap.

### 3. Detailed Source Information

Provides a dedicated view for individual sources, including available source facts, inspection-priority explanations, score factors, groundwater trends, and recent reports.

### 4. Search and Filtering

Allows users to narrow the source list using:

- Inspection priority
- District
- Text search

Filtering is performed in the browser, avoiding additional API requests for these operations.

### 5. Structured Report Submission

Provides a form for submitting source-related reports to the backend. The interface includes validation, duplicate-submit protection, and error handling to make the submission workflow clearer.

Report submission remains subject to the backend's authentication and authorization configuration.

### 6. Groundwater Trend Visualization

Displays available groundwater trend information and associated source-to-station mappings. Provisional data are labelled appropriately so users can distinguish demonstration information from verified observations.

### 7. Transparent and Responsible Data Presentation

WellWatch avoids presenting unavailable information as fact. Missing scores, levels, and reasons are identified as not provided or not scored.

The platform also distinguishes inspection-priority heuristics from verified failure predictions.

## System Architecture

The application follows a frontend-to-backend architecture.

1. **Frontend:** A React and Vite web application presents the dashboard, map, filters, source details, and report form.
2. **REST API:** The frontend communicates with backend endpoints to retrieve source information, request source details, and submit reports.
3. **Backend services:** API Gateway and the configured backend integrations process supported requests and apply the relevant access controls.
4. **Data and prioritization logic:** Source records, groundwater trend mappings, and inspection-priority information supply the data displayed by the application.
5. **Hosting:** AWS Amplify Hosting can serve the production frontend from the GitHub repository.

### API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/sources` | Retrieve the available water-source records and associated information. |
| `GET` | `/sources/{source_id}` | Retrieve details for a specific source. |
| `POST` | `/reports` | Submit a source-related report, subject to backend authorization. |

The source-list response includes a count and a collection of source records. The frontend normalizes API responses before displaying them.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Frontend development server and production build |
| JavaScript | Application logic and API integration |
| MapLibre | Interactive map rendering |
| OpenStreetMap | Alternative basemap |
| Amazon Location Service | Optional mapping service |
| REST API | Communication between frontend and backend |
| Amazon API Gateway | API routing and access-control integration |
| AWS Amplify Hosting | Frontend deployment and hosting |
| Git and GitHub | Version control and source-code management |

## Installation and Local Setup

### Prerequisites

- Node.js 18 or later
- npm
- Git

### Run the Application

Clone the repository and enter the frontend directory:

```bash
git clone https://github.com/ddakshatha18-spec/Well-Watch.git
cd Well-Watch/frontend
npm install
```

Optionally, create a local environment configuration:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173

### Run Tests and Build

Run these commands from the `frontend/` directory:

```bash
npm test
npm run build
```

The build command generates the production assets in `frontend/dist` when executed from the repository root, or `dist` when executed inside `frontend/`.

## Environment Configuration

The frontend supports the following public configuration variables:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |
| `VITE_API_PROXY_TARGET` | Target URL for the development proxy |
| `VITE_LOCATION_API_KEY` | Optional Amazon Location Service API key |
| `VITE_LOCATION_REGION` | AWS region for the mapping service |

The API base URL defaults to the team's configured deployed API. The mapping configuration can fall back to OpenStreetMap.

**Security:** Never store Bearer tokens, AWS access keys, AWS secret keys, or other confidential credentials in frontend source code or `VITE_` environment variables. Values prefixed with `VITE_` can be included in the public browser bundle.

## Security and Authentication

Protected API routes use Bearer-token authorization according to the current backend configuration. The frontend does not embed a shared secret in its source code.

For a public deployment, report submission should use an agreed authentication model and appropriate validation and abuse protections. Options include a controlled demonstration workflow with suitable API throttling or an authenticated solution using Amazon Cognito and a JWT authorizer.

API Gateway CORS settings must also permit the intended deployed frontend origin and required request headers.

## Deployment with AWS Amplify

1. Push the project to GitHub.
2. Open the AWS Amplify Console.
3. Connect the GitHub repository and select the `main` branch.
4. Verify that the build configuration uses `amplify.yml` and the frontend application root.
5. Configure required public environment variables.
6. Deploy the application and wait for the build to complete.
7. Test the hosted dashboard and its connection to the backend API.

Frontend hosting and backend deployment are separate operations. Deploying the frontend does not automatically deploy or modify the backend API.

## Project Structure

```text
Well-Watch/
├── amplify.yml
├── README.md
├── frontend/
│   ├── src/
│   │   ├── api/          # API client and error handling
│   │   ├── lib/          # Data normalization and validation
│   │   ├── hooks/        # Source data and detail hooks
│   │   ├── components/   # Dashboard and interface components
│   │   └── test/         # Automated tests
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── REQUIREMENTS.md
│   └── DEMO_SCRIPT.md
└── data/
    ├── sources_seed.csv
    └── source_trends.csv
```

## Design System

The interface uses an earthy, accessible visual identity intended to communicate water-source monitoring and field operations.

| Design Element | Value |
|---|---|
| Deep Earth | `#513229` |
| Warm Milk | `#F4F1E2` |
| Soft Sky | `#D8EBF9` |
| Warm Amber | `#E8B979` |

The typography combines Antonio for condensed display headings, Playfair Display for editorial emphasis, and Source Sans 3 for body text and data.

Priority is not communicated through colour alone. Text labels and additional visual indicators help distinguish the available priority levels.

## Data Limitations

The current demonstration includes synthetic water-source records and provisional groundwater trend mappings. These datasets are not verified field measurements.

- Inspection-priority scores are heuristics for organizing inspections.
- Scores must not be interpreted as verified pump-failure probabilities.
- Groundwater trends require appropriate validation before real-world decisions are made.
- The accuracy of the dashboard depends on the quality and completeness of the underlying data.
- Real-world deployment requires suitable data validation, operational testing, and security controls.

## Expected Impact

WellWatch aims to make water-source inspection planning more systematic by consolidating source information, inspection priorities, map-based exploration, and field reporting in a single interface.

By presenting the available evidence and its limitations clearly, the platform can support better-organized fieldwork and more transparent inspection decisions.

## Conclusion

WellWatch provides a unified interface for exploring village water sources, understanding inspection priorities, examining available groundwater trends, and submitting source-related reports.

Its central objective is to **help field teams decide which water sources to inspect first using transparent information and clearly communicated data limitations.**
