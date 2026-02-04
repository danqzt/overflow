#inside infra folder
aspire publish -o .
aspire deploy -o . 
aspire do docker-compose-down-overflow -o . -d
aspire do docker-compose-up-overflow -o . -d

#aspire do prepare-overflow --environment staging -o infra
#aspire do docker-compose-up-overflow -environment staging -o infra
#in infra folder: docker-compose --env-file .env.staging up -d

#get secrets:
dotnet user-secrets list --project Overflow.AppHost 
dotnet user-secrets set "Parameters:pg-username" "pg-user" --project Overflow.AppHost
dotnet user-secrets set "Parameters:pg-password" "Pass@word1" --project Overflow.AppHost

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
docker rmi -f $(docker images search-svc -q) $(docker images vote-svc -q) $(docker images webapp -q) $(docker images question-svc -q) $(docker images stat-svc -q) $(docker images profile-svc -q)
docker rmi -f $(docker images webapp -q) 


#rebuild and restart only one service (change env vars)
docker compose --env-file .env.staging up -d --force-recreate --no-deps webapp

#aws
ssh -i overflow.pem ec2-user@3.104.113.125
ssh -i ~/.ssh/id_rsa ubuntu@3.104.113.125

#prod troubleshoot:
docker ps --format '{{.ID}} {{.Image}} {{.Status}}'
docker log 2a8a0a56561d
ocker volume ls | grep vhost
docker volume inspect overflowapphost_vhost
sudo cp overflow.danqzt.com /var/lib/docker/volumes/overflowapphost_vhost/_data/
docker compose restart nginx-proxy-acme -d
