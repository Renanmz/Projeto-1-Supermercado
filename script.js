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

    inputPrecoTotal.value = "";
    inputTotalRecebido.value = "";
    inputTroco.value = "";

    const botaoExcluir = document.querySelector("#opcoes button:nth-child(2)"); // botão "Excluir item"
    const modalExcluir = document.getElementById("modal-excluir");
    const inputNumeroExcluir = document.getElementById("numero-excluir");
    const btnConfirmarExcluir = document.getElementById("confirmar-excluir");
    const btnCancelarExcluir = document.getElementById("cancelar-excluir");

    let produtosJSON = [];
    let precoTotal = 0;

    const botaoNovaVenda = document.querySelector("#opcoes button:nth-child(3)");

    // Nova Venda - limpa tudo
    botaoNovaVenda.addEventListener("click", () => {
        // Limpa tabela
        tabela.innerHTML = "";

        // Reseta totais
        precoTotal = 0;
        inputPrecoTotal.value = "";
        inputTotalRecebido.value = "";
        inputTroco.value = "";

        // Reseta inputs de produto
        inputCodigo.value = "";
        inputNome.value = "";
        inputPreco.value = "";
        inputUnidade.value = "";

        // Foca no código para já começar outra venda
        inputCodigo.focus();
    });

    // Carregar arquivo JSON
    fetch("produtos.json")
        .then(res => res.json())
        .then(data => {
            produtosJSON = data;
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));

    // Buscar produto ao digitar código
    inputCodigo.addEventListener("change", () => {
        const codigo = inputCodigo.value.trim();
        const produto = produtosJSON.find(p => p.Codigo === codigo);

        if (produto) {
            inputNome.value = produto.Nome;
            inputPreco.value = produto.Preco.toFixed(2);
        } else {
            inputNome.value = "";
            inputPreco.value = "";
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

        // Atualiza o preço total da compra
        precoTotal += total;
        inputPrecoTotal.value = "R$ " + precoTotal.toFixed(2);

        // Reorganiza números da tabela
        atualizarNumeros();

        // Limpar campos
        inputCodigo.value = "";
        inputNome.value = "";
        inputPreco.value = "";
        inputUnidade.value = "";
        inputCodigo.focus();

        // Recalcular troco se já houver valor recebido
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
            linha.cells[0].textContent = index + 1;
        });
    }

    // Abrir modal de exclusão
    botaoExcluir.addEventListener("click", () => {
        modalExcluir.style.display = "flex";
        inputNumeroExcluir.value = "";
        inputNumeroExcluir.focus();
    });

    // Cancelar exclusão
    btnCancelarExcluir.addEventListener("click", () => {
        modalExcluir.style.display = "none";
    });

    // Confirmar exclusão
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
});
