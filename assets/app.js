/* ============================================================
   LLM Solutions — vanilla JS
   - mobile nav toggle
   - scroll reveal
   - in-browser "RAG" chatbot demo (client-side, no backend)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     Demo chatbot — simulates a RAG assistant answering ONLY from
     a small "indexed knowledge base". Pure front-end, no network.
     This mirrors how a real deployed chatbot would behave: it
     answers from the candidate's documents and politely declines
     when there is no match.
     ============================================================ */
  var log = document.getElementById("demoLog");
  if (!log) return;

  var input = document.getElementById("demoInput");
  var form = document.getElementById("demoForm");
  var chips = document.querySelectorAll(".chip");

  // The "knowledge base": each entry has trigger keywords, an answer
  // and a cited source — exactly the shape a RAG system returns.
  var KB = [
    {
      k: ["solucao", "solucoes", "servico", "servicos", "oferecem", "fazem", "faz"],
      a: "Trabalhamos com quatro frentes: presenca da sua candidatura nas respostas das IAs (AEO), chatbot com IA treinado nos seus materiais, site institucional e infraestrutura preparada para o periodo de campanha.",
      s: "documento: solucoes.pdf"
    },
    {
      k: ["aeo", "chatgpt", "gemini", "respostas", "aparecer", "ia responde", "buscar"],
      a: "AEO (Answer Engine Optimization) e o trabalho tecnico e de conteudo para aumentar a chance de a sua candidatura ser citada de forma correta e favoravel quando o eleitor pergunta ao ChatGPT, ao Gemini ou ao Claude.",
      s: "documento: aeo_overview.pdf"
    },
    {
      k: ["chatbot", "assistente", "robo", "atendimento", "rag", "responde"],
      a: "O chatbot e um assistente que conversa com o eleitor 24h por dia. Ele responde com base apenas nos documentos que voce fornece (arquitetura RAG); quando nao encontra a informacao, avisa de forma educada em vez de inventar.",
      s: "documento: chatbot_rag.pdf"
    },
    {
      k: ["site", "website", "pagina", "hospedagem", "infra", "ddos", "ataque", "seguranca"],
      a: "Entregamos um site institucional profissional no ar rapidamente, em infraestrutura dimensionada para suportar picos de acesso e reduzir o risco de instabilidade nas semanas decisivas da campanha.",
      s: "documento: site_infra.pdf"
    },
    {
      k: ["prazo", "tempo", "quanto tempo", "entrega", "demora"],
      a: "Os prazos sao definidos no onboarding conforme o pacote escolhido. A estrutura e pensada para entrar no ar com rapidez, ainda dentro da janela util da campanha.",
      s: "documento: onboarding.pdf"
    },
    {
      k: ["preco", "valor", "custo", "quanto custa", "investimento", "pacote"],
      a: "Trabalhamos com tres pacotes (Essencial, Completo e Premium) e condicoes especiais por perfil. O valor exato e apresentado em uma conversa rapida, de acordo com o que o gabinete precisa.",
      s: "documento: pacotes.pdf"
    },
    {
      k: ["contato", "falar", "reuniao", "conversa", "demonstracao", "demo", "email", "whatsapp"],
      a: "Voce pode falar com a gente pelo e-mail lucas@llmsolutions.com.br ou pela pagina de Contato. Marcamos uma conversa de 15 minutos, sem compromisso.",
      s: "documento: contato.pdf"
    }
  ];

  var FALLBACK = "Nao encontrei esse ponto nos documentos indexados desta demonstracao. Em um chatbot real, ele responderia apenas com base nos materiais do seu gabinete — e, sem correspondencia, avisa assim, em vez de inventar uma resposta.";

  function normalize(t) {
    return t.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-z0-9 ]/g, " ");
  }

  function findAnswer(q) {
    var n = normalize(q);
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var score = 0;
      entry.k.forEach(function (kw) {
        if (n.indexOf(normalize(kw)) !== -1) score += kw.length;
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return best;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function addMessage(role, text, source) {
    var wrap = el("div", "msg " + role);
    wrap.appendChild(el("div", "who", role === "ai" ? "IA" : "Vc"));
    var body = el("div", "text");
    body.textContent = text;
    if (source) {
      var src = el("span", "source", "Fonte: " + source);
      body.appendChild(src);
    }
    wrap.appendChild(body);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function addTyping() {
    var wrap = el("div", "msg ai");
    wrap.appendChild(el("div", "who", "IA"));
    wrap.appendChild(el("div", "text typing", "<span></span><span></span><span></span>"));
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function respond(q) {
    var typing = addTyping();
    setTimeout(function () {
      log.removeChild(typing);
      var hit = findAnswer(q);
      if (hit) addMessage("ai", hit.a, hit.s);
      else addMessage("ai", FALLBACK, null);
    }, 650 + Math.random() * 450);
  }

  function ask(q) {
    q = (q || "").trim();
    if (!q) return;
    addMessage("user", q, null);
    respond(q);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ask(input.value);
      input.value = "";
      input.focus();
    });
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () { ask(c.textContent); });
  });

  // Greeting
  addMessage("ai", "Ola! Sou uma demonstracao de chatbot com IA da LLM Solutions. Pergunte sobre nossas solucoes, o chatbot, AEO ou o site.", null);
})();
