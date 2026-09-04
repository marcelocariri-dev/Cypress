import fs from "fs";
import path from "path";

const { allureCypress } = require("allure-cypress/reporter");
const setupGrep = require("@cypress/grep/src/plugin");

type ListarXMLsParams = {
  usarApenasSemFaturas?: boolean;
};

type TestParallelCaseStatus = {
  fullName: string;
  file: string;
  grep: string;
  status: "passed" | "retry";
  testStatus: string;
  stop: number;
  updatedAt: string;
};

type TestParallelState = {
  updatedAt: string;
  cases: TestParallelCaseStatus[];
};

const registrarResultadoInterativo = (
  spec: Cypress.Spec,
  results: CypressCommandLine.RunResult,
): void => {
  if (!results.tests || results.tests.length === 0) {
    return;
  }

  const logsPath = path.join(process.cwd(), "logs");
  const statusPath = path.join(logsPath, "test-parallel-status.json");
  const file = spec.relative.replace(/\\/g, "/").replace(/^\.\//, "");
  const stop = Date.now();
  const updatedAt = new Date(stop).toISOString();

  let state: TestParallelState = { updatedAt, cases: [] };
  if (fs.existsSync(statusPath)) {
    const savedState = JSON.parse(fs.readFileSync(statusPath, "utf8")) as Partial<TestParallelState>;
    state = { updatedAt, cases: savedState.cases ?? [] };
  }

  const cases = new Map(state.cases.map((result) => [result.fullName, result]));
  results.tests.forEach((test) => {
    const grep = test.title.join(" ");
    const fullName = `${file}#${grep}`;
    cases.set(fullName, {
      fullName,
      file,
      grep,
      status: test.state === "passed" ? "passed" : "retry",
      testStatus: test.state,
      stop,
      updatedAt,
    });
  });

  fs.mkdirSync(logsPath, { recursive: true });
  fs.writeFileSync(
    statusPath,
    JSON.stringify({
      updatedAt,
      cases: Array.from(cases.values()).sort((a, b) => a.fullName.localeCompare(b.fullName)),
    }, null, 2),
    "utf8",
  );
};

const setupNodeEvents = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Cypress.PluginConfigOptions => {
  const allurePlugin = allureCypress(on, config);
  setupGrep(config);

  if (config.isInteractive) {
    on("after:spec", (spec, results) => {
      allurePlugin.onAfterSpec(spec, results);

      if (results) {
        registrarResultadoInterativo(spec, results);
      }
    });
  }

  // Task para listar arquivos XML da pasta comprasxml.
  on("task", {
    listarXMLs({ usarApenasSemFaturas = false }: ListarXMLsParams = {}) {
      const basePath = path.join(process.cwd(), "cypress", "fixtures", "comprasxml");
      const xmlPath = usarApenasSemFaturas
        ? path.join(basePath, "xmlSemFaturas")
        : basePath;

      try {
        const arquivos = fs.readdirSync(xmlPath);
        const xmls = arquivos.filter((arquivo) => arquivo.endsWith(".xml"));
        return xmls;
      } catch (error) {
        process.stderr.write(`Erro ao listar XMLs: ${String(error)}\n`);
        return [];
      }
    },
  });

  on("before:browser:launch", (browser, launchOptions) => {
    if (browser.family === "chromium" && browser.name !== "electron") {
      // Desativa GPU se estiver sentindo lentidão visual no Chrome.
      launchOptions.args.push("--disable-gpu");

      // Força gerenciamento de memória mais agressivo.
      launchOptions.args.push("--js-flags=--max-old-space-size=4096");
    }

    return launchOptions;
  });

  return config;
};

export default setupNodeEvents;
