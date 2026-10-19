CONTAINER_PGRM := $(shell command -v podman || command -v docker)
UID := $(shell id -u)
GID := $(shell id -g)
TARGETS := dev prod compile-webapp integ-tests lint unit-tests start-test start-dev
DEV_OCI_IMAGE := scowport-dev
PROD_OCI_IMAGE := scowport
.ONESHELL:

nothing:
	@echo "Available targets: $(TARGETS)"

dev:
	cpp -o Dockerfile container/dockerfile/dev.docker
	$(CONTAINER_PGRM) build -t $(DEV_OCI_IMAGE) -f Dockerfile .

prod:
	cpp -o Dockerfile container/dockerfile/prod.docker
	$(CONTAINER_PGRM) build -t $(PROD_OCI_IMAGE) -f Dockerfile .

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

.PHONY: nothing $(TARGETS) lint-local lint-api lint-app lint-integ-tests compile-webapp-local clean unit-tests-local
