/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from '../containers/Bills.js';
import { ROUTES } from '../constants/routes';
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import "@testing-library/jest-dom";
import store from '../__mocks__/store';
import Store from '../app/Store.js'
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";


//Initialisation de la Navigation 
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))

      const windowIcon = screen.getByTestId('icon-window') // récupère l'icône par son testid
      //check si l'icône est en surbrillance - on vérifie si l'élément a la classe correspondante
      expect(windowIcon).toHaveClass('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : +1) // On change la valeur -1 to +1
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

  // Test vérifiant le click sur l'oeil pour ouvrir le modal et affichage de l'image
  describe('When I am on Bills page and I click on an icon eye', () => {
    test('Then a modal should open', () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const billsContainer = new Bills({
        document,
        onNavigate,
        Store: null,
        localStorage: window.localStorage,
      });

      const modale = document.getElementById('modaleFile')
        $.fn.modal = jest.fn(() => modale.classList.add("show"))

      const iconEye = screen.getAllByTestId('icon-eye')[0];

      const handleClickIconEye = jest.fn(
        billsContainer.handleClickIconEye(iconEye)
      );

      iconEye.addEventListener('click', handleClickIconEye);
      userEvent.click(iconEye);
      expect(handleClickIconEye).toHaveBeenCalled();
    });

    test('Then the modal should display the attached image', () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const billsContainer = new Bills({
        document,
        onNavigate,
        Store: null,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getAllByTestId('icon-eye')[0];
      billsContainer.handleClickIconEye(iconEye);
      expect(document.querySelector('.modal')).toBeTruthy();
    });
  });


  // TEST : redirection sur nouvelle note de frais si on click sur le bouton new bill
  describe('When I am on Bills page and I click on the new bill button Nouvelle note de frais', () => {
    test('Then I should navigate to newBill page bill/new', () => {
      document.body.innerHTML = BillsUI({ bills });
      const billsContainer = new Bills({
        document,
        onNavigate,
        Store: null,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener('click', handleClickNewBill);
      userEvent.click(newBillButton);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    });
  });





    // test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => { 
    test("fetches bills from mock API GET", async () => {
      //DELETED
    })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

})

})

