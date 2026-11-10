# ==============================================================================
# PRALEYE (प्रलय-दृष्टि): Instant-Run Makefile
# Zero-Config Multi-Hazard Disaster Intelligence & Command Platform
# ==============================================================================

.PHONY: setup dev dev-backend dev-frontend test test-backend test-frontend clean

setup:
	@echo "--- 1/3 Initializing Environment ---"
	@if not exist .env copy .env.example .env
	@echo "--- 2/3 Installing Python Dependencies ---"
	pip install -r backend/requirements.txt
	@echo "--- 3/3 Installing Frontend Dependencies ---"
	cd frontend && npm install

dev-backend:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

test-backend:
	set PYTHONPATH=backend&& pytest backend/tests/ -v

test-frontend:
	cd frontend && npm run test

test: test-backend test-frontend

clean:
	@if exist backend\data\praleye.db del backend\data\praleye.db
	@if exist backend\data\praleye.db-wal del backend\data\praleye.db-wal
	@if exist backend\data\praleye.db-shm del backend\data\praleye.db-shm

