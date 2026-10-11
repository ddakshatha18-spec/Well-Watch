# WellWatch — 5-minute demo script

Say this early and plainly: **WellWatch ranks which pumps to inspect first. It does not predict when a pump will fail.** The 24 sources are synthetic and the trends are provisional.

**0:00 — The problem (30 s).** Pumps are usually fixed after they run dry. Public groundwater data shows regional decline but cannot say which pump is next. Teams need to know which pump to visit first, and why.

**0:30 — The one screen (60 s).** Open the live URL. Point at the "Read this first" note, then the ranked list: rank, High/Medium/Low, score, reasons. Click the **High** chip to filter, then pick a district.

**1:30 — Map and detail (60 s).** Click a marker: the list and detail follow. In the detail, read the plain-language reasons, then "How the score is built" and the trend card (note *Unverified* status).

**2:30 — Report changes priority (75 s).** Press **Report observation** (works on a phone). Choose the source you just opened, "Low flow", today's date, submit. Show the "Report saved" panel with the new priority, then the list re-ranking. (Needs a working token/CORS: check beforehand.)

**3:45 — AWS (45 s).** S3 → Lambda → API Gateway → DynamoDB, hosted on Amplify, map from Amazon Location Service or OpenStreetMap. Backend by Person 3 (SAM template); trends by Person 1; scoring by Person 2.

**4:30 — Honest limits (30 s).** Synthetic local data, provisional trends, nearby stations cannot predict an individual pump's failure date. Next: real field data, Cognito login for field teams, Hindi/Telugu reasons.

**Before you present:** open the live URL in a private window, confirm the list loads, submit one test report on a demo source, and keep a screenshot ready in case the network fails.
