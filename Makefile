.PHONY: update-restart

update-restart:
	docker-compose build
	docker-compose down
	docker-compose up -d

logs:
	docker logs -f transferwise-webhook