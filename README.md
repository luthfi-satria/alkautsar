## BACKUP DATABASE
```bash
#BACKUP

$ docker exec -it mariadb mariadb-dump -u sditalkautsar -p --databases alkautsar --skip-triggers --no-create-db -c > dump_data.sql

#RESTORE
$ docker exec -i mariadb mariadb-dump -u sditalkautsar -p --databases alkautsar < ../dump_data.sql
```

## BACKUP UPLOADS FILE
```bash
#BACKUP FILE
$ docker cp lajuApi:/app/uploads alkautsar/

#RESTORE FILE
$ docker cp ~/projects/alkautsar/uploads lajuApi:/app
```