import LoginPage from "../../support/pages/login/LoginPage";
import EmpresaPage from "../../support/pages/Empresa/EmpresaPage";

describe('login válido spec', () => {
it("O login deve ser realizado", () =>{
LoginPage.visit();
cy.env(['username', 'password']).then(({username, password}) => {
LoginPage.preencherLogin(username, password);
})

LoginPage.fazerLogin()

EmpresaPage.selecionarMatriz();

})
} ) ;