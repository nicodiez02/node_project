const addToShoppingCartButtons = document.querySelectorAll('.addToCart');
const buyButton = document.getElementById('btn_buy');

buyButton.addEventListener('click', buy);

addToShoppingCartButtons.forEach((addToCartButton) => {
  addToCartButton.addEventListener('click', addToCartClicked);
});


const shoppingCartItemsContainer = document.querySelector('.container_cart');

function addToCartClicked(event) {
  const button = event.target;
  const item = button.closest('.item');

  const itemTitle = item.querySelector('.title');
  const itemPrice = item.querySelector('.price');
  const itemPriceID = item.querySelector('.price_id')

  addItemToShoppingCart(itemTitle, itemPrice, itemPriceID);
}

function addItemToShoppingCart(itemTitle, itemPrice, itemPriceID) {
  const elementsTitle = shoppingCartItemsContainer.getElementsByClassName('product');

  for (let i = 0; i < elementsTitle.length; i++) {
    if (elementsTitle[i].innerText === itemTitle.innerText) {
      let elementQuantity = elementsTitle[i].parentElement.querySelector('.select_cart');
      elementQuantity.value++;
      updateShoppingCartTotal();
      return;
    }
  }

  const shoppingCartRow = document.createElement('div');
  const shoppingCartContent = `
      <div class="shoppingCartItem">

      <input hidden name = "price_id" value = "${itemPriceID.innerHTML}">

      <div class="list-group list-group-flush border-bottom scrollarea item_cart">

          <div href="#" class="list-group-item list-group-item-action py-3 lh-tight cart_item" aria-current="true">
            <div class="d-flex w-100 align-items-center justify-content-between">
              <strong id = "title" class="mb-1 product">${itemTitle.innerHTML}</strong>

              <select name = "quantity" class = "select_cart">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>

          </div>
        <div class="col-10 mb-1 small product_price">${itemPrice.innerText}</div>
        <button class = "buttonDelete btn btn-danger btn-sm" id = "btn_delete_item"><i class="far fa-trash-alt"></i></button>
      </div>
    </div>
    </div>`;

  shoppingCartRow.innerHTML = shoppingCartContent;
  shoppingCartItemsContainer.append(shoppingCartRow);

  shoppingCartRow
    .querySelector('.buttonDelete')
    .addEventListener('click', removeShoppingCartItem);

  shoppingCartRow
    .querySelector('.select_cart')
    .addEventListener('change', quantityChanged);

  updateShoppingCartTotal();
}

function updateShoppingCartTotal() {
  let total = 0;
  const items = document.querySelectorAll('.cart_item')
  const total_pric = document.querySelector('.total');

  items.forEach((prices_cart) => {
    const item_cart_prices = prices_cart.querySelector('.product_price');
    const item_cart_prices2 = Number(item_cart_prices.textContent.replace('$', ''));
    const select_value = Number(prices_cart.querySelector('.select_cart').value);

    total = total + item_cart_prices2 * select_value;

  });

  total_pric.innerHTML = `$${total.toFixed(2)}`
}

function removeShoppingCartItem(event) {
  const buttonClicked = event.target;
  buttonClicked.closest('.shoppingCartItem').remove();
  updateShoppingCartTotal();
}

function quantityChanged(event) {
  const input = event.target;
  input.value <= 0 ? (input.value = 1) : null;
  updateShoppingCartTotal();
}

function buy() {
  let arrayIDs = [];
  const contenedores = document.querySelectorAll('.shoppingCartItem')

  const mp = new MercadoPago("APP_USR-2963d23f-17ee-4c7f-a986-1a20f2ae84cc", {
    locale: "es-AR",
  });

  for (let i = 0; i < contenedores.length; i++) {
    // let id = contenedores[i].querySelectorAll('#id_price');
    let price = contenedores[i].querySelector('.product_price').innerText;
    let title = contenedores[i].querySelector('#title').innerHTML;
    let quantity = contenedores[i].querySelector('.select_cart').value;
    arrayIDs[i] = {title: title, unit_price:price ,quantity: quantity}
  }

  $.ajax({
    url: 'http://localhost:3001/create-checkout-session',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(arrayIDs),
    success: function(data){
      mp.checkout({
        preference: {
          id: data,
        },
        autoOpen: true,
      });
    },
    error: function(error){
      console.log(error)
    }
  })  
}

/*
USUARIO1:
{"id":1066155748,"nickname":"TESTZO19J8PP","password":"qatest824","site_status":"active","email":"test_user_3919583@testuser.com"}

USUARIO2
{"id":1066163856,"nickname":"TETE5758201","password":"qatest2260","site_status":"active","email":"test_user_58217753@testuser.com"}

TEST-3245432846007298-013019-768123638a90632c96015e42894b8b3e-670233031

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer TEST-3245432846007298-013019-768123638a90632c96015e42894b8b3e-670233031" "https://api.mercadopago.com/users/test_user" -d "{"site_id":"MLA"}"
*/