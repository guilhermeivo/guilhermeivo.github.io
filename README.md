<h1 align="center">
  🕹️ guilhermeivo.github.io
</h1>

<h1 align="center">
    <img alt="Cover" src=".github/banner.png" />
</h1>

> Projeto desenvolvido usando [WebAssembly](https://developer.mozilla.org/docs/WebAssembly) (WasiSDK) e [WebGL API](https://developer.mozilla.org/docs/Web/API/WebGL_API)

# Organização

`public/`\
`src/`\
 ├ `WebGL/`: Recursos usados para conectar com a WebGL API.\
 └ `wasm.h`: Baseado nos recursos utilizados no [wasi-libc](https://github.com/WebAssembly/wasi-libc).\
`test/`

# Rodando

Rodar aplicação:
```
$ npm install
$ ./build.sh && ./run.sh
```

# Testes/Benchmarks

```
$ ./test.sh -r -t<NUMBER>
```

| Realizar Benchmarks | Quantidade |
|---------------------|------------|
| -r                  | -t<NUMBER> |

<img src="https://github.githubassets.com/images/mona-whisper.gif" align="right" />

## License
Este projeto está sob licença. Consulte o arquivo [`LICENSE`](./LICENSE) para obter detalhes.