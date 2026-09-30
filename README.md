# Como en Casa

Carta para retirar o delivery. El cliente arma el pedido en el sitio y lo manda por WhatsApp. La cocina edita platos, precios y el número que recibe los mensajes en `/admin`.

La referencia de uso es una carta tipo [Fu.do](https://menu.fu.do/giunti): categorías fijas arriba, fila con foto y precio, suma rápida, y el pedido se cierra en un paso.

## Correr

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). La cocina está en [http://localhost:3000/admin](http://localhost:3000/admin).

La clave inicial es `comoencasa`. Antes de publicar, definí `ADMIN_PASSWORD` (y, si querés, `ADMIN_SECRET`) en el entorno. La carta vive en `data/store.json`: el panel la reescribe cuando tocás Publicar.

El WhatsApp de ejemplo es `5491112345678`. Cambialo en Cocina → El local por el número real, con código de país y sin signos.

Los precios de la carta inicial son un punto de partida para editar.
# comoencasa-web
