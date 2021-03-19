/// <reference types='cypress' />

import { format, prepareLocalStorage } from '../support/utils'

// cy.viewport
// arquivos de config
// passar as configs por linha de comando

context('Dev Finances Agilizei', () => {

    // hooks
    // trechos que executam antes e depois do teste
    // begore -> antes de todps os testes
    // beforeEach -> antes de cada teste
    // after -> depois de todps os testes
    // afterEach -> depois de cada teste

    beforeEach(() => {
        cy.visit('https://devfinance-agilizei.netlify.app', {
            onBeforeLoad: (win) => {
                prepareLocalStorage(win)
            }
        })
        //cy.get('#data-table tbody tr').should('have.length', 2)
    });

    it('Cadastrar entradas', () => {
        // - entender o fluxo manualmente
        // - mapear os elementos que vamos interagir
        // - descrever as interações com o cypress
        // - adicionar as asserções que a gente precisa

        cy.get('#transaction .button').click() // id + classe
        cy.get('#description').type('Mesada') // id
        cy.get('[name=amount]').type(12) // atributos
        cy.get('[type=date]').type('2021-03-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        cy.get('#data-table tbody tr').should('have.length', 3)
    });

    it('Cadastrar saídas', () => {

        cy.get('#transaction .button').click() // id + classe
        cy.get('#description').type('Mesada') // id
        cy.get('[name=amount]').type(-12) // atributos
        cy.get('[type=date]').type('2021-03-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

    });

    it('Remover entradas e saídas', () => {
        const entrada = 'Mesada'
        const saida = 'KinderOvo'

        cy.get('#transaction .button').click() // id + classe
        cy.get('#description').type(entrada) // id
        cy.get('[name=amount]').type(100) // atributos
        cy.get('[type=date]').type('2021-03-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        cy.get('#transaction .button').click() // id + classe
        cy.get('#description').type(saida) // id
        cy.get('[name=amount]').type(-35) // atributos
        cy.get('[type=date]').type('2021-03-17') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        // estratégia 1: voltar para o elemento pai e avançar para um td attr
        cy.get('td.description')
            .contains(entrada)
            .parent()
            .find('img[onclick*=remove]')
            .click()

        // estratégia 2: buscar todos os irmaos e buscar o que tem img + attr
        cy.get('td.description')
            .contains(saida)
            .siblings()
            .children('img[onclick*=remove]')
            .click()

        cy.get('#data-table tbody tr').should('have.length', 2)

    });

    it('Validar saldo com diversas transações', () => {

        // capturar as linhas com as transacoes e as colunas com valores
        // capturar o texto dessas colunas
        // formatar esses valores das linhas
        // somar os valores de entradas e saidas
        // capturar o texto do total
        // comparar o somatorio de entradas e despesas com o total

        let incomes = 0
        let expenses = 0

        cy.get('#data-table tbody tr').each(($el, index, $list) => {
            cy.get($el).find('td.income, td.expense')
                .invoke('text').then(text => {
                    if(text.includes('-')) {
                        expenses = expenses + format(text)
                    } else {
                        incomes = incomes + format(text)
                    }

                    cy.log('entradas', incomes)
                    cy.log('saidas', expenses)
                })
        })
        cy.get('#totalDisplay').invoke('text').then(text => {
            let formatedTotalDisplay = format(text)
            let expectedTotal = incomes + expenses

            expect(formatedTotalDisplay).to.eq(expectedTotal)
        })
    });
});