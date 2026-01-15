.PHONY: build run up down logs shell

# Build the Docker image
build:
	docker build -t vibe2g .

# Run the container directly (requires .env.local)
run:
	docker run -p 3000:3000 --env-file .env.local vibe2g

# Start with Docker Compose
up:
	docker-compose up -d

# Stop Docker Compose
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Enter the container shell
shell:
	docker-compose exec web sh
