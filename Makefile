.PHONY: build tag push logs update-restart up-re up-re-dev

REPO ?= stevenc4/transferwise-webhook
DATETIME = $(shell date +%Y%m%d)

build:
	docker build -t $(REPO) .

tag:
	docker tag $(REPO):latest $(REPO):$(DATETIME)

push:
	docker push $(REPO)

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
