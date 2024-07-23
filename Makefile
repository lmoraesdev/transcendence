GREEN    = \e[92m
RESET    = \e[0m

COMPOSE  = srcs/docker-compose.yml
VOLUME   = /home/transcendence/data

all: run

run:
	@echo "$(GREEN)** Files for volumes ** $(RESET)"
	@sudo mkdir -p $(VOLUME)/wordpress
	@sudo mkdir -p $(VOLUME)/mariadb
	@echo "$(GREEN)** Compose Up ** $(RESET)"
	@docker-compose --file=$(COMPOSE) up --build --detach

up:
	@echo "$(GREEN)** Compose Up ** $(RESET)"
	@docker-compose --file=$(COMPOSE) up --build --detach

down:
	@echo "$(GREEN)** Compose down ** $(RESET)"
	@docker-compose --file=$(COMPOSE) down --rmi all --remove-orphans -v

start:
	@echo "$(GREEN)** Start containers ** $(RESET)"
	@docker-compose --file=$(COMPOSE) start

stop:
	@echo "$(GREEN)** Stop containers ** $(RESET)"
	@docker-compose --file=$(COMPOSE) stop

ls:
	@echo "$(GREEN)**** List containers ****$(RESET)"
	@docker container ls -a
	@echo "$(GREEN)**** List Images ****$(RESET)"
	@docker images
	@echo "$(GREEN)**** List Volumes ****$(RESET)"
	@docker volume ls
	@echo "$(GREEN)**** List Network ****$(RESET)"
	@docker network ls

clean: down

fclean: clean
	@echo "$(GREEN)** Removing data... **$(RESET)"
	@sudo rm -rf $(VOLUME)
	@sudo rm -rf /srcs/data
	@sudo rm -rf /srcs/backend/data
	# docker system prune --all --force --volumes

re: fclean all
	@echo "$(GREEN)** Restarting containers... **$(RESET)"

build:
	@echo "$(GREEN)** Build containers ** $(RESET)"
	@docker-compose --file=$(COMPOSE) build

restart: down up

logs:
	@echo "$(GREEN)** Logs **$(RESET)"
	@docker-compose --file=$(COMPOSE) logs

ps:
	@echo "$(GREEN)** Logs **$(RESET)"
	@docker-compose --file=$(COMPOSE) ps

exec:
	@echo "$(GREEN)** Exec **$(RESET)"
	@docker-compose --file=$(COMPOSE) exec $(SERVICE) $(COMMAND)

.PHONY: all run up down start stop ls clean fclean re build restart logs exec help ps
help:
	@echo "Available targets:"
	@echo "  up       : Start the containers"
	@echo "  down     : Stop and remove the containers"
	@echo "  restart  : Restart the containers"
	@echo "  logs     : Show the logs of the containers"
	@echo "  exec     : Execute a command inside a service container"
	@echo "  build    : Build the containers"
