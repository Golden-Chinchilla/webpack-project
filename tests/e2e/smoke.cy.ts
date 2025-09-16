/// <reference types="cypress" />
describe("Red Packet App - Smoke Test", () => {
    it("页面能渲染关键元素", () => {
        cy.visit("/");
        cy.contains("发红包").should("be.visible");
        cy.contains("抢红包").should("be.visible");
        cy.contains("连接钱包").should("be.visible");
    });
});
