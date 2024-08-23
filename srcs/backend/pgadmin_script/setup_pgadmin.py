import os
import json

from pgadmin4 import db, create_app
from pgadmin4.models import Server, User

app = create_app()
with app.app_context():
    user = User.query.filter_by(email=os.getenv('PGADMIN_DEFAULT_EMAIL')).first()
    if user:
        server = Server(
            user_id=user.id,
            servergroup_id=1,
            name="PostgreSQL Server",
            host="postgres",
            port=5432,
            maintenance_db="postgres",
            password=os.getenv('PGADMIN_DEFAULT_PASSWORD'),
        )
        db.session.add(server)
        db.session.commit()