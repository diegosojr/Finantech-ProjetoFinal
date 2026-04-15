const paginaAtual = window.location.pathname;
let transacaoEditandoId = null;
let editandoDespesaFixaId = null;
let grafico;
let graficoResumoMensal;

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    alert("Você saiu da conta.");
    window.location.href = "login.html";
}

function setTipoTransacao(tipo) {
    setTimeout(() => {
        const campoTipo = document.getElementById("tipo");
        const campoDescricao = document.getElementById("desc");

        if (campoTipo) campoTipo.value = tipo;
        if (campoDescricao) campoDescricao.focus();
    }, 100);
}


async function login() {
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        alert("Preencha e-mail e senha.");
        return;
    }

    try {
        const response = await fetch("/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("nome", data.name);
            alert("Login realizado com sucesso!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "E-mail ou senha inválidos.");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function cadastrar() {
    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!name || !email || !password) {
        alert("Preencha nome, e-mail e senha.");
        return;
    }

    try {
        const response = await fetch("/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Cadastro realizado com sucesso!");
            window.location.href = "login.html";
        } else {
            alert(data.message || data.error || "Erro ao cadastrar");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

if (
    paginaAtual.includes("index.html") ||
    paginaAtual.includes("metas.html") ||
    paginaAtual.includes("despesas-fixas.html") ||
    paginaAtual.includes("resumo-mensal.html") ||
    paginaAtual === "/"
) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    } else {
        const nome = localStorage.getItem("nome");
        const nomeEl = document.getElementById("nome-usuario");

        if (nome && nomeEl) {
            nomeEl.textContent = "Bem-vindo, " + nome;
        }

        if (paginaAtual.includes("index.html") || paginaAtual === "/") {
            carregarDashboard(token);
            carregarTransacoes(token);
        }

        if (paginaAtual.includes("metas.html")) {
            carregarMetas(token);
        }

        if (paginaAtual.includes("despesas-fixas.html")) {
            carregarDespesasFixas(token);
        }

        if (paginaAtual.includes("resumo-mensal.html")) {
            prepararResumoMensal();
        }
    }
}


async function carregarDashboard(token) {
    try {
        const response = await fetch("/finance/dashboard", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });

        const data = await response.json();

        if (response.ok) {
            const saldo = document.getElementById("saldo");
            const receitas = document.getElementById("total-receitas");
            const despesas = document.getElementById("total-despesas");

            if (saldo) saldo.textContent = "R$ " + Number(data.saldo).toFixed(2);
            if (receitas) receitas.textContent = "R$ " + Number(data.receitas).toFixed(2);
            if (despesas) despesas.textContent = "R$ " + Number(data.despesas).toFixed(2);

            atualizarGrafico(data.receitas, data.despesas);
        } else {
            alert(data.error || data.message || "Erro ao carregar dashboard");
        }
    } catch (error) {
        alert("Erro ao carregar dashboard");
    }
}


async function carregarTransacoes(token) {
    try {
        const response = await fetch("/finance/transactions", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });

        const data = await response.json();

        const lista = document.getElementById("lista-transacoes");
        if (!lista) return;

        lista.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            lista.innerHTML = "<li>Nenhuma transação cadastrada.</li>";
            return;
        }

        data.forEach((t) => {
            const li = document.createElement("li");
            li.classList.add("item-transacao");
            li.onclick = () => abrirModalTransacao(t);

            li.innerHTML = `
                <span class="icone-transacao ${t.type}">
                    ${t.type === "receita" ? "↑" : "↓"}
                </span>
                <span class="texto-transacao">
                    ${t.description || "Sem descrição"}
                </span>
            `;

            lista.appendChild(li);
        });
    } catch (error) {
        alert("Erro ao carregar transações.");
    }
}

function abrirModalTransacao(transacao) {
    transacaoEditandoId = transacao._id;

    document.getElementById("modal-tipo").value = transacao.type || "";
    document.getElementById("modal-descricao").value = transacao.description || "";
    document.getElementById("modal-valor").value = transacao.value || "";
    document.getElementById("modal-categoria").value = transacao.category || "";
    document.getElementById("modal-data").value = new Date(transacao.date).toISOString().split("T")[0];

    document.getElementById("modal-transacao").classList.add("ativo");
}

function fecharModalTransacao(event) {
    const modal = document.getElementById("modal-transacao");
    if (!modal) return;

    if (!event || event.target === modal) {
        modal.classList.remove("ativo");
    }
}

async function salvarEdicaoTransacao() {
    try {
        const token = localStorage.getItem("token");

        const body = {
            type: document.getElementById("modal-tipo").value,
            value: Number(document.getElementById("modal-valor").value),
            category: document.getElementById("modal-categoria").value,
            description: document.getElementById("modal-descricao").value,
            date: document.getElementById("modal-data").value
        };

        const response = await fetch(`/finance/transaction/${transacaoEditandoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            alert("Transação atualizada!");
            fecharModalTransacao();
            carregarDashboard(token);
            carregarTransacoes(token);
        } else {
            const data = await response.json();
            alert(data.error || "Erro ao atualizar");
        }
    } catch {
        alert("Erro na conexão");
    }
}

async function excluirTransacao() {
    const confirmar = confirm("Deseja excluir esta transação?");
    if (!confirmar) return;

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/finance/transaction/${transacaoEditandoId}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
        });

        if (response.ok) {
            alert("Transação excluída!");
            fecharModalTransacao();
            carregarDashboard(token);
            carregarTransacoes(token);
        } else {
            const data = await response.json();
            alert(data.error || "Erro ao excluir");
        }
    } catch {
        alert("Erro na conexão");
    }
}


async function carregarMetas(token) {
    try {
        const response = await fetch("/finance/goals", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });

        const data = await response.json();

        const lista = document.getElementById("lista-metas");
        if (!lista) return;

        lista.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            lista.innerHTML = "<p>Nenhuma meta cadastrada.</p>";
            return;
        }

        data.forEach((meta) => {
            const item = document.createElement("div");
            item.classList.add("card", "card-meta");

            item.innerHTML = `
                <div class="meta-topo">
                    <label class="checkbox-meta">
                        <input type="checkbox" ${meta.completed ? "checked" : ""} onchange="toggleMetaConcluida('${meta._id}')">
                        <span class="checkmark"></span>
                    </label>

                    <div class="meta-conteudo ${meta.completed ? "meta-concluida" : ""}">
                        <h3>${meta.name}</h3>
                        <p><strong>Valor:</strong> R$ ${Number(meta.value).toFixed(2)}</p>
                        <p><strong>Prazo:</strong> ${new Date(meta.deadline).toLocaleDateString("pt-BR")}</p>
                    </div>
                </div>
            `;

            lista.appendChild(item);
        });
    } catch (error) {
        alert("Erro ao carregar metas.");
    }
}

async function toggleMetaConcluida(id) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/finance/goal/${id}/toggle-completed`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await response.json();

        if (response.ok) {
            carregarMetas(token);
        } else {
            alert(data.error || data.message || "Erro ao atualizar meta");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}


function calcularStatusDespesaFixa(despesa) {
    if (despesa.paid) {
        return { classe: "status-paga", texto: "Paga" };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(despesa.date);
    vencimento.setHours(0, 0, 0, 0);

    const diffMs = vencimento - hoje;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return { classe: "status-vencida", texto: "Vencida" };
    if (diffDias === 0) return { classe: "status-hoje", texto: "Vence hoje" };

    return {
        classe: "status-proxima",
        texto: `Vence em ${diffDias} dia${diffDias > 1 ? "s" : ""}`
    };
}


async function carregarDespesasFixas(token) {
    try {
        const response = await fetch("/finance/fixed-expenses", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });

        const data = await response.json();

        const lista = document.getElementById("lista-despesas-fixas");
        if (!lista) return;

        lista.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            lista.innerHTML = "<p>Nenhuma despesa fixa cadastrada.</p>";
            return;
        }

        data.forEach((despesa) => {
            const status = calcularStatusDespesaFixa(despesa);

            const item = document.createElement("div");
            item.classList.add("card", "card-despesa-fixa");

            item.innerHTML = `
                <div class="despesa-fixa-topo">
                    <h3>${despesa.description}</h3>
                    <span class="badge-status ${status.classe}">${status.texto}</span>
                </div>

                <p><strong>Categoria:</strong> ${despesa.category}</p>
                <p><strong>Valor:</strong> R$ ${Number(despesa.value).toFixed(2)}</p>
                <p><strong>Data:</strong> ${new Date(despesa.date).toLocaleDateString("pt-BR")}</p>

                <div class="acoes-despesa-fixa">
                    <button class="btn-marcar-paga" onclick="toggleDespesaFixaPaga('${despesa._id}')">
                        ${despesa.paid ? "Desmarcar pagamento" : "Marcar como paga"}
                    </button>

                    <button class="btn-editar" onclick='preencherEdicaoDespesaFixa(${JSON.stringify(despesa).replace(/'/g, "&apos;")})'>
                        Editar
                    </button>

                    <button class="btn-excluir" onclick="excluirDespesaFixa('${despesa._id}')">
                        Excluir
                    </button>
                </div>
            `;

            lista.appendChild(item);
        });
    } catch (error) {
        alert("Erro ao carregar despesas fixas.");
    }
}

async function toggleDespesaFixaPaga(id) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/finance/fixed-expense/${id}/toggle-paid`, {
            method: "PATCH",
            headers: { Authorization: "Bearer " + token }
        });

        const data = await response.json();

        if (response.ok) {
            carregarDespesasFixas(token);
        } else {
            alert(data.error || data.message || "Erro ao atualizar despesa fixa");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

function preencherEdicaoDespesaFixa(despesa) {
    editandoDespesaFixaId = despesa._id;

    document.getElementById("categoria-despesa-fixa").value = despesa.category;
    document.getElementById("descricao-despesa-fixa").value = despesa.description;
    document.getElementById("valor-despesa-fixa").value = despesa.value;
    document.getElementById("data-despesa-fixa").value = new Date(despesa.date).toISOString().split("T")[0];

    document.getElementById("titulo-form-despesa-fixa").textContent = "Editar Despesa Fixa";
    document.getElementById("btn-salvar-despesa-fixa").textContent = "Salvar Alterações";
    document.getElementById("btn-cancelar-edicao-despesa").style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cancelarEdicaoDespesaFixa() {
    editandoDespesaFixaId = null;

    const form = document.getElementById("form-despesa-fixa");
    if (form) form.reset();

    document.getElementById("titulo-form-despesa-fixa").textContent = "Nova Despesa Fixa";
    document.getElementById("btn-salvar-despesa-fixa").textContent = "Salvar Despesa Fixa";
    document.getElementById("btn-cancelar-edicao-despesa").style.display = "none";
}

async function atualizarDespesaFixa(id, body) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/finance/fixed-expense/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Despesa fixa atualizada com sucesso!");
            cancelarEdicaoDespesaFixa();
            carregarDespesasFixas(token);
        } else {
            alert(data.error || data.message || "Erro ao atualizar despesa fixa");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function excluirDespesaFixa(id) {
    const confirmar = confirm("Deseja realmente excluir esta despesa fixa?");
    if (!confirmar) return;

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/finance/fixed-expense/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
        });

        const data = await response.json();

        if (response.ok) {
            alert("Despesa fixa excluída com sucesso!");
            carregarDespesasFixas(token);
        } else {
            alert(data.error || data.message || "Erro ao excluir despesa fixa");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}


function atualizarGrafico(receitas, despesas) {
    const canvas = document.getElementById("meuGrafico");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Receitas", "Despesas"],
            datasets: [{
                data: [receitas, despesas],
                backgroundColor: ["#2ecc71", "#e74c3c"]
            }]
        }
    });
}


function prepararResumoMensal() {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const inputInicial = document.getElementById("resumo-data-inicial");
    const inputFinal = document.getElementById("resumo-data-final");

    if (inputInicial && inputFinal) {
        inputInicial.value = primeiroDia.toISOString().split("T")[0];
        inputFinal.value = hoje.toISOString().split("T")[0];
    }

    const formResumo = document.getElementById("form-resumo-mensal");
    if (formResumo) {
        formResumo.addEventListener("submit", async (e) => {
            e.preventDefault();
            await carregarResumoMensal();
        });
    }

    carregarResumoMensal();
}

async function carregarResumoMensal() {
    try {
        const token = localStorage.getItem("token");
        const startDate = document.getElementById("resumo-data-inicial").value;
        const endDate = document.getElementById("resumo-data-final").value;

        const query = `
            query MonthlySummary($startDate: String!, $endDate: String!) {
                monthlySummary(startDate: $startDate, endDate: $endDate) {
                    receitas
                    despesas
                    despesasFixas
                    saldo
                    fixedExpensesList {
                        _id
                        category
                        description
                        value
                        date
                        paid
                    }
                }
            }
        `;

        const response = await fetch("/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                query,
                variables: {
                    startDate,
                    endDate
                }
            })
        });

        const result = await response.json();

        if (result.errors) {
            alert(result.errors[0].message || "Erro ao carregar resumo mensal");
            return;
        }

        const data = result.data.monthlySummary;

        document.getElementById("resumo-receitas").textContent = "R$ " + Number(data.receitas).toFixed(2);
        document.getElementById("resumo-despesas").textContent = "R$ " + Number(data.despesas).toFixed(2);
        document.getElementById("resumo-despesas-fixas").textContent = "R$ " + Number(data.despesasFixas).toFixed(2);
        document.getElementById("resumo-saldo").textContent = "R$ " + Number(data.saldo).toFixed(2);

        atualizarGraficoResumoMensal(data.receitas, data.despesas, data.despesasFixas);
        preencherListaResumoDespesasFixas(data.fixedExpensesList);
    } catch (error) {
        alert("Erro ao carregar resumo mensal.");
    }
}

function atualizarGraficoResumoMensal(receitas, despesas, despesasFixas) {
    const canvas = document.getElementById("graficoResumoMensal");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficoResumoMensal) {
        graficoResumoMensal.destroy();
    }

    graficoResumoMensal = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Receitas", "Despesas", "Despesas Fixas"],
            datasets: [{
                label: "Resumo do Período",
                data: [receitas, despesas, despesasFixas],
                backgroundColor: ["#2ecc71", "#e74c3c", "#f39c12"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function preencherListaResumoDespesasFixas(lista) {
    const container = document.getElementById("lista-resumo-despesas-fixas");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = "<p>Nenhuma despesa fixa encontrada no período.</p>";
        return;
    }

    lista.forEach((despesa) => {
        const item = document.createElement("div");
        item.classList.add("card", "card-resumo-item");

        item.innerHTML = `
            <h3>${despesa.description}</h3>
            <p><strong>Categoria:</strong> ${despesa.category}</p>
            <p><strong>Valor:</strong> R$ ${Number(despesa.value).toFixed(2)}</p>
            <p><strong>Data:</strong> ${new Date(despesa.date).toLocaleDateString("pt-BR")}</p>
        `;

        container.appendChild(item);
    });
}

const formTransacao = document.getElementById("form-transacao");

if (formTransacao) {
    formTransacao.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const body = {
            type: document.getElementById("tipo").value,
            value: Number(document.getElementById("valor").value),
            category: document.getElementById("categoria").value,
            description: document.getElementById("desc").value,
            date: document.getElementById("data").value
        };

        try {
            const response = await fetch("/finance/transaction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Transação salva com sucesso!");
                formTransacao.reset();
                carregarDashboard(token);
                carregarTransacoes(token);
            } else {
                alert(data.error || data.message || "Erro ao salvar transação");
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
        }
    });
}


const formMeta = document.getElementById("form-meta");

if (formMeta) {
    formMeta.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const body = {
            name: document.getElementById("nome-meta").value,
            value: Number(document.getElementById("valor-meta").value),
            deadline: document.getElementById("prazo-meta").value
        };

        if (!body.name || !body.value || !body.deadline) {
            alert("Preencha todos os campos da meta.");
            return;
        }

        try {
            const response = await fetch("/finance/goal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Meta salva com sucesso!");
                formMeta.reset();
                carregarMetas(token);
            } else {
                alert(data.error || data.message || "Erro ao salvar meta");
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
        }
    });
}


const formDespesaFixa = document.getElementById("form-despesa-fixa");

if (formDespesaFixa) {
    formDespesaFixa.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const body = {
            category: document.getElementById("categoria-despesa-fixa").value,
            description: document.getElementById("descricao-despesa-fixa").value,
            value: Number(document.getElementById("valor-despesa-fixa").value),
            date: document.getElementById("data-despesa-fixa").value
        };

        if (!body.category || !body.description || !body.value || !body.date) {
            alert("Preencha todos os campos da despesa fixa.");
            return;
        }

        if (editandoDespesaFixaId) {
            atualizarDespesaFixa(editandoDespesaFixaId, body);
            return;
        }

        try {
            const response = await fetch("/finance/fixed-expense", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Despesa fixa salva com sucesso!");
                formDespesaFixa.reset();
                carregarDespesasFixas(token);
            } else {
                alert(data.error || data.message || "Erro ao salvar despesa fixa");
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
        }
    });
}