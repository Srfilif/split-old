#!/bin/bash

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Iniciar el bot
echo "Iniciando el bot..."
node index.js
