import EmpresaLoginLocators from "../../locators/Empresa/EmpresaLoginLocators";

class EmpresaPage {

    selecionarMatriz() {
        cy.get(EmpresaLoginLocators.linkEmpresaMatriz).click();
    };

} export default new EmpresaPage();
