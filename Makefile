CONTAINER_PGRM := $(shell command -v podman || command -v docker)
UID := $(shell id -u)
GID := $(shell id -g)
TARGETS := dev test prod compile-webapp integ-tests lint unit-tests start-test start-dev
DEV_OCI_IMAGE := scowport-dev
TEST_OCI_IMAGE := scowport-test
PROD_OCI_IMAGE := scowport
PLAYWRIGHT_WORKERS := 1
.ONESHELL:

nothing:
	@echo "Available targets: $(TARGETS)"

dev:
	make compile-webapp-dev
	cpp -o Dockerfile container/dockerfile/dev.docker
	$(CONTAINER_PGRM) build -t $(DEV_OCI_IMAGE) -f Dockerfile .

test:
	make compile-webapp-dev
	cpp -o Dockerfile container/dockerfile/test.docker
	$(CONTAINER_PGRM) build -t $(TEST_OCI_IMAGE) -f Dockerfile .

prod:
	cpp -o Dockerfile container/dockerfile/prod.docker
	$(CONTAINER_PGRM) build -t $(PROD_OCI_IMAGE) -f Dockerfile .

compile-webapp-dev:
	cd app
	mkdir -p dist
	rm -rf ../public/*.{js,css,map,png}
	npm install --save-dev
	NODE_ENV=development npm run build
	cp -r dist/* ../public/

compile-webapp-local:
	cd app
	mkdir -p dist
	rm -rf ../public/*.{js,css,map,png}
	npm install --save-dev
	npm run build
	cp -r dist/* ../public/

compile-webapp: dev
	$(CONTAINER_PGRM) run --rm -it --name "scowport-lint" \
		--user $(UID):$(GID) \
		-e UID=$(UID) -e GID=$(GID) -e CI \
		-v "$(CURDIR):/scowport:z" \
		$(DEV_OCI_IMAGE) \
		make compile-webapp-local

compile-ci:
	cd app
	mkdir -p dist
	npm run build
	cp -r dist/* ../public/

lint-app:
	cd app
	npm install --save-dev
	npm run analyze
	npm run stylelint

lint-local: lint-app

lint: dev
	$(CONTAINER_PGRM) run --rm -it --name "scowport-lint" \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/scowport:z" \
		$(DEV_OCI_IMAGE) \
		make lint-local

start-dev: dev
	$(CONTAINER_PGRM) run --rm -it --name "scowport" \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/scowport:z" \
		$(DEV_OCI_IMAGE)

start-test: prod
	$(CONTAINER_PGRM) run --rm -it --name "scowport" \
		-p 8080:8080 \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR)"/translations:/scowport/translations:z \
		-v "$(CURDIR)"/data:/scowport/data:z \
		-v "$(CURDIR)"/public:/scowport/public:z \
		$(PROD_OCI_IMAGE)

clean:
	rm -f Dockerfile

define RUN_PLAYWRIGHT_CONTAINER
	set -eu; \
	export SHLINK_API_KEY="$$(openssl rand -hex 32)"; \
	export SHLINK_DB_PASSWORD="$$(openssl rand -hex 32)"; \
	docker network inspect playwright-network >/dev/null 2>&1 || docker network create playwright-network; \
	trap 'cd "$(CURDIR)/test" && $(CONTAINER_PGRM) compose -f compose-$(1).yaml down || true; docker network rm playwright-network || true' EXIT; \
	cd test && $(CONTAINER_PGRM) compose -f compose-$(1).yaml up -d; \
	until curl -s http://localhost:8532 > /dev/null; do \
		echo "Waiting for app..."; \
		sleep 5; \
	done; \
	docker run -it --rm \
		--network playwright-network \
		--ipc=host \
		-p 9323:8080 \
		-v "$(CURDIR)/app:/app" -w /app \
		-e PLAYWRIGHT_HTML_OPEN=never \
		-e PLAYWRIGHT_BASE_URL=http://scowport-test:8080 \
		mcr.microsoft.com/playwright:v1.65.0-noble \
		npx playwright test e2e/$(1)-config --workers $(PLAYWRIGHT_WORKERS) $(2)
endef

playwright-default-ci:
	$(call RUN_PLAYWRIGHT,default)

playwright-nondefault-ci:
	$(call RUN_PLAYWRIGHT,nondefault)

playwright:
	make test
	$(call RUN_PLAYWRIGHT_CONTAINER,default)
	$(call RUN_PLAYWRIGHT_CONTAINER,nondefault)

playwright-ui:
	make test
	$(call RUN_PLAYWRIGHT_CONTAINER,default,--ui --ui-host 0.0.0.0 --ui-port 8080)
	$(call RUN_PLAYWRIGHT_CONTAINER,nondefault,--ui --ui-host 0.0.0.0 --ui-port 8080)
	
.PHONY: nothing $(TARGETS) lint-local lint-api lint-app lint-integ-tests compile-webapp-local clean unit-tests-local
