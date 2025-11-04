from logging.config import fileConfig
import os
from dotenv import dotenv_values # Import dotenv_values

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from app.database import Base
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def get_database_url():
    # Get the directory of the env.py file
    script_dir = os.path.dirname(__file__)
    # Go up one level to get to the alembic directory, then up another to get to the backend directory
    backend_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))
    # Path to the .env file in the backend directory
    env_path = os.path.join(backend_dir, "backend", ".env")
    env_vars = dotenv_values(env_path)

    # Construct the database URL
    db_hostname = env_vars.get("DATABASE_HOSTNAME")
    db_port = env_vars.get("DATABASE_PORT")
    db_name = env_vars.get("DATABASE_NAME")
    db_username = env_vars.get("DATABASE_USERNAME")
    db_password = env_vars.get("DATABASE_PASSWORD")

    if not all([db_hostname, db_port, db_name, db_username, db_password]):
        raise Exception(f"Missing database environment variables in {env_path} file.")

    return f"postgresql://{db_username}:{db_password}@{db_hostname}:{db_port}/{db_name}"

# Set the database URL in the config object
config.set_main_option("sqlalchemy.url", get_database_url())


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # The URL is already set in the config object
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # The URL is already set in the config object
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
