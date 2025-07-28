## HOW TO RUN
### setup
#### frontend
```bash
cd frontend
npm install
```

#### backend
```bash
cd backend
python3 -m venv env # create virtual env
source env/bin/activate
pip install -r requirements.txt
```

#### etc
please create `.env` from `.env.sample` and fill empty variables in both `frontend` and `backend`.


### run
- frontend
```bash
cd frontend
npm run dev
```
- backend
```bash
cd backend
uvicorn app:app --reload --host localhost --port 8080
```
