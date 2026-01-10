#All these need to run in the infra folder
#generate docker compose file
aspire publish -environment staging -o .

#build container
aspire do prepare-compose --environment staging --output .
aspire deploy -o infra

#running docker compose for staging environment
docker images webapp --format "{{.Tag}}" | head -n 1 | xargs -I{} sed -i '' -E 's|^WEBAPP_IMAGE=.*$|WEBAPP_IMAGE=webapp:{}|' '.env.staging'
docker compose --env-file .env.staging up -d 

#turning off existing containers
docker compose --env-file .env.staging down
docker rmi -f $(docker images search-svc -q) $(docker images webapp -q) $(docker images question-svc -q)
docker rmi -f $(docker images webapp -q) 


#rebuild and restart only one service (change env vars)
docker compose --env-file .env.staging up -d --force-recreate --no-deps webapp
