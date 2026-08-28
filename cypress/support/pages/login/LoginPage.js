import LoginLocators from "../../locators/login/loginLocators";



class LoginPage {

visit () {
    cy.visit('/auth/login')
    cy.url().should('include', '/auth/login')
    cy.get('body').should('be.visible')
};

preencherLogin(username, password) 
{   cy.get(LoginLocators.usernameInput).type(username);
    cy.get(LoginLocators.passwordInput).type(password);
};

fazerLogin (){
cy.get(LoginLocators.loginButton).click();

};

MensagemErro () {
    cy.get(LoginLocators.errorMessage)
};
} export default new LoginPage();