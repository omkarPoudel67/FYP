FROM python:3.12.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*



COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY requirements2.txt .
RUN pip3 install -r requirements2.txt
COPY . .



EXPOSE 8000

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]


