1. cd to notes-rest-api

2. docker-compose down && docker-compose up --build
* here note that this time compose it not taking `name:` passed in individual compose files, check out the how it has named the containers, volumes and networks

3. we will have to add the reverse proxy and notes, notebooks backend in same network to avail access by name

4. docker-compose down && docker-compose up --build -d

5. docker-compose ps 
verify if all containers are up especially reverse-proxy

6. curl http://localhost:5000/api/notebooks

7. curl http://localhost:5000/api/notes