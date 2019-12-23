.PHONY: logs update-restart up-re up-re-dev

logs:
	docker logs -f transferwise-webhook

update-restart:
up-re:
	docker-compose build
	docker-compose down
	docker-compose up -d

up-re-dev:
	docker-compose -f docker-compose.dev.yaml build
	docker-compose -f docker-compose.dev.yaml down
	docker-compose -f docker-compose.dev.yaml up -d
