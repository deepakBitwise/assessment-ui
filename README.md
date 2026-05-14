# assesment-ui

```bash
npm install
npm run dev
```

Delete the local build cache:

```bash
Remove-Item -Recurse -Force .next
```

## Demo sign-in credentials

The UI authenticates against the FastAPI backend at `NEXT_PUBLIC_API_BASE_URL`
or `http://localhost:8000/api/v1` by default.

| Role | Email | Password |
| --- | --- | --- |
| Learner | `learner@example.com` | `SecurePass123!` |
| Reviewer | `reviewer@example.com` | `SecurePass123!` |
| Admin | `admin.user@example.com` | `SecurePass123!` |

After running backend migrations, seed these users with:

```bash
python -m app.initial_data
```
