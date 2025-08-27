document.addEventListener("DOMContentLoaded", () => {
    const inputCodigo = document.getElementById("input-codigo");
    const inputNome = document.getElementById("input-nome");
    const inputPreco = document.getElementById("input-preco");
    const inputUnidade = document.getElementById("input-unidade");
    const botaoAdicionar = document.getElementById("botao-adicionar");
    const tabela = document.querySelector("#tabela-produtos tbody");

    const inputPrecoTotal = document.getElementById("input-preco-total");
    const inputTotalRecebido = document.getElementById("input-total-recebido");
    const inputTroco = document.getElementById("input-troco");

    // imagem do produto
    const fotoProduto = document.getElementById("foto-produto");

    // limpa valores ao carregar página
    inputPrecoTotal.value = "";
    inputTotalRecebido.value = "";
    inputTroco.value = "";

    // Botões e modais
    const botaoExcluir = document.querySelector("#opcoes button:nth-child(2)");
    const modalExcluir = document.getElementById("modal-excluir");
    const inputNumeroExcluir = document.getElementById("numero-excluir");
    const btnConfirmarExcluir = document.getElementById("confirmar-excluir");
    const btnCancelarExcluir = document.getElementById("cancelar-excluir");

    const botaoNovaVenda = document.querySelector("#opcoes button:nth-child(3)");

    // ---- Pesquisa de Produto ----
    const botaoPesquisar = document.querySelector("#opcoes button:nth-child(1)");
    const modalPesquisa = document.getElementById("modal-pesquisa");
    const tabelaPesquisa = document.querySelector("#tabela-pesquisa tbody");
    const campoPesquisa = document.getElementById("campo-pesquisa");
    const btnFecharPesquisa = document.getElementById("fechar-pesquisa");

    let produtosJSON = [];
    let precoTotal = 0;

    // Nova Venda - limpa tudo
    botaoNovaVenda.addEventListener("click", () => {
        tabela.innerHTML = "";
        precoTotal = 0;
        inputPrecoTotal.value = "";
        inputTotalRecebido.value = "";
        inputTroco.value = "";

        inputCodigo.value = "";
        inputNome.value = "";
        inputPreco.value = "";
        inputUnidade.value = "";
        fotoProduto.src = ""; // limpa a imagem
        fotoProduto.style.display = "none";
        inputCodigo.focus();
    });

    // Carregar arquivo JSON
    fetch("produtos.json")
        .then(res => res.json())
        .then(data => {
            produtosJSON = data;
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));

    // Função auxiliar para preencher os campos + imagem
    function preencherProduto(produto) {
        inputNome.value = produto.Nome;
        inputPreco.value = produto.Preco.toFixed(2);

        if (produto.Imagem) {
            fotoProduto.src = produto.Imagem;
            fotoProduto.style.display = "block";
        } else {
            fotoProduto.src = "";
            fotoProduto.style.display = "none";
        }
    }

    // Buscar produto ao digitar código
    inputCodigo.addEventListener("change", () => {
        const codigo = inputCodigo.value.trim();
        const produto = produtosJSON.find(p => p.Codigo === codigo);

        if (produto) {
            preencherProduto(produto);
        } else {
            inputNome.value = "";
            inputPreco.value = "";
            fotoProduto.src = "";
            fotoProduto.style.display = "none";
            alert("Produto não encontrado!");
        }
    });

    // Adicionar produto à tabela
    botaoAdicionar.addEventListener("click", () => {
        const codigo = inputCodigo.value.trim();
        const nome = inputNome.value.trim();
        const preco = parseFloat(inputPreco.value);
        const unidades = parseInt(inputUnidade.value);

        if (!codigo || !nome || isNaN(preco) || isNaN(unidades)) {
            alert("Preencha todos os campos corretamente!");
            return;
        }

        const total = preco * unidades;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td></td>
            <td>${codigo}</td>
            <td>${nome}</td>
            <td>R$ ${preco.toFixed(2)}</td>
            <td>${unidades}</td>
            <td>R$ ${total.toFixed(2)}</td>
        `;

        tabela.appendChild(row);

        precoTotal += total;
        inputPrecoTotal.value = "R$ " + precoTotal.toFixed(2);

        atualizarNumeros();

        inputCodigo.value = "";
        inputNome.value = "";
        inputPreco.value = "";
        inputUnidade.value = "";
        fotoProduto.src = ""; // limpa a imagem depois de adicionar
        fotoProduto.style.display = "none";
        inputCodigo.focus();

        calcularTroco();
    });

    // Calcular troco automaticamente
    inputTotalRecebido.addEventListener("input", calcularTroco);

    function calcularTroco() {
        const recebido = parseFloat(inputTotalRecebido.value);
        if (!isNaN(recebido)) {
            const troco = recebido - precoTotal;
            inputTroco.value = troco >= 0 ? "R$ " + troco.toFixed(2) : "Valor insuficiente!";
        } else {
            inputTroco.value = "";
        }
    }

    // Atualizar coluna Nº
    function atualizarNumeros() {
        const linhas = tabela.querySelectorAll("tr");
        linhas.forEach((linha, index) => {
            linha.cells[0].textContent = (index + 1).toString().padStart(4, "0");
        });
    }

    // ---- Exclusão ----
    botaoExcluir.addEventListener("click", () => {
        modalExcluir.style.display = "flex";
        inputNumeroExcluir.value = "";
        inputNumeroExcluir.focus();
    });

    btnCancelarExcluir.addEventListener("click", () => {
        modalExcluir.style.display = "none";
    });

    btnConfirmarExcluir.addEventListener("click", () => {
        const numero = parseInt(inputNumeroExcluir.value);
        const linhas = tabela.querySelectorAll("tr");

        if (isNaN(numero) || numero < 1 || numero > linhas.length) {
            alert("Número inválido!");
            return;
        }

        const linha = linhas[numero - 1];
        const valorLinha = linha.cells[5].textContent.replace("R$", "").trim().replace(",", ".");
        precoTotal -= parseFloat(valorLinha);
        inputPrecoTotal.value = "R$ " + precoTotal.toFixed(2);

        linha.remove();
        atualizarNumeros();
        calcularTroco();

        modalExcluir.style.display = "none";
    });

    // ---- Pesquisa de Produto ----
    botaoPesquisar.addEventListener("click", () => {
        modalPesquisa.style.display = "flex";
        renderizarTabelaPesquisa(produtosJSON);
        campoPesquisa.value = "";
        campoPesquisa.focus();
    });

    btnFecharPesquisa.addEventListener("click", () => {
        modalPesquisa.style.display = "none";
    });

    function renderizarTabelaPesquisa(lista) {
        const grid = document.getElementById("grid-pesquisa");
        grid.innerHTML = "";

        lista.forEach(prod => {
            const card = document.createElement("div");
            card.className = "card-produto";
            card.innerHTML = `
                ${prod.Imagem ? `<img src="${prod.Imagem}" alt="${prod.Nome}">` : ""}
                <strong>${prod.Nome}</strong>
                <p>Código: ${prod.Codigo}</p>
                <p>Preço: R$ ${prod.Preco.toFixed(2)}</p>
                <button>Selecionar</button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                inputCodigo.value = prod.Codigo;
                preencherProduto(prod);
                modalPesquisa.style.display = "none";
                inputUnidade.focus();
            });

            grid.appendChild(card);
        });
    }

    campoPesquisa.addEventListener("input", () => {
        const termo = campoPesquisa.value.toLowerCase();
        const filtrados = produtosJSON.filter(p => p.Nome.toLowerCase().includes(termo));
        renderizarTabelaPesquisa(filtrados);
    });

    const botaoEfetuarCompra = document.getElementById("btn-efetuar-compra");

    // Faz o mesmo que "Nova Venda"
    botaoEfetuarCompra.addEventListener("click", () => {
        botaoNovaVenda.click();
    });
});
