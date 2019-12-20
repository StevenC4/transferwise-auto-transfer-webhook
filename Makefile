.PHONY: logs update-restart

logs:
	docker logs -f transferwise-webhook

update-restart:
	docker-compose build
	docker-compose down
	docker-compose up -d
