describe('Flujo de compra completo en SauceDemo', () => {
  beforeEach(() => {
    cy.visit('https://www.saucedemo.com/');
  });

  it('Realiza una compra', () => {
    // Login
    cy.fixture('user').then((user) => {
      cy.getByData('username').type(user.username);
      cy.getByData('password').type(user.password);
    });
    cy.getByData('login-button').click();

    // Validar que entró
    cy.url().should('include', '/inventory');

    // Agregar productos al carrito
    cy.getByData('add-to-cart-sauce-labs-backpack').click();
    cy.getByData('add-to-cart-sauce-labs-bike-light').click();

    // Ir al carrito
    cy.get('.shopping_cart_link').click();
    cy.url().should('include', '/cart');

    // Verificar productos en el carrito
    cy.get('.cart_item').should('have.length', 2);

    // Checkout
    cy.getByData('checkout').click();
    cy.url().should('include', '/checkout-step-one');

    // Ingresar información de envío
    cy.getByData('firstName').type('Juan');
    cy.getByData('lastName').type('Tester');
    cy.getByData('postalCode').type('12345');
    cy.getByData('continue').click();

    // Confirmar resumen
    cy.url().should('include', '/checkout-step-two');
    cy.get('.summary_info').should('exist');

    // Verificar precios individuales
    cy.get('.inventory_item_price').eq(0).should('contain', '$29.99');
    cy.get('.inventory_item_price').eq(1).should('contain', '$9.99');

    // Verificar subtotal
    cy.get('.summary_subtotal_label').then(($el) => {
      const subtotalText = $el.text(); // "Item total: $39.98"
      const subtotal = parseFloat(subtotalText.replace('Item total: $', ''));
      expect(subtotal).to.equal(29.99 + 9.99);
    });

    // Verificar tax
    cy.get('.summary_tax_label').then(($el) => {
      const taxText = $el.text(); // "Tax: $3.20"
      const tax = parseFloat(taxText.replace('Tax: $', ''));
      expect(tax).to.be.greaterThan(0);

      // Verificar total final
      cy.get('.summary_total_label').then(($el2) => {
        const totalText = $el2.text(); // "Total: $43.18"
        const total = parseFloat(totalText.replace('Total: $', ''));
        expect(total).to.equal(29.99 + 9.99 + tax);
      });
    });

    // Finalizar compra
    cy.getByData('finish').click();

    // Confirmación
    cy.url().should('include', '/checkout-complete');
    cy.contains('Thank you for your order!').should('be.visible');
  });
});