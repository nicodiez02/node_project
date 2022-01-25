const buttons_array = document.querySelectorAll('.addToCart');

buttons_array.forEach((add_buttons) => {
    add_buttons.addEventListener('click', getData);
});

function getData(event){
    const target_button = event.target;
    const item = target_button.closest('.item');

    const title = item.querySelector('.title');
    const price = item.querySelector('.price');

    addTo(title, price);
}

function addTo(title, price) {

    
    const div = document.querySelector('.container_cart')
    const item_div = document.createElement('div');
    const div_content = `
        <div class="list-group list-group-flush border-bottom scrollarea item_cart">

          <div href="#" class="list-group-item list-group-item-action py-3 lh-tight cart_item" aria-current="true">
            <div class="d-flex w-100 align-items-center justify-content-between">
              <strong class="mb-1 product">${title.innerHTML}</strong>
              <select class = "select_cart">
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
            <div class="col-10 mb-1 small product_price">${price.innerText}</div>
            <button class = "btn btn-danger btn-sm" id = "btn_delete_item"><i class="far fa-trash-alt"></i></button>
          </div>
        </div>`;

    
    item_div.innerHTML = div_content;
    div.append(item_div);

    div.addEventListener('click', deleteItem);
    updatePrice();

    document.querySelector('.select_cart').addEventListener('change', updatePrice);
    
}

function updatePrice() {
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

function deleteItem(event) {
    const buttonTarget = event.target;
    buttonTarget.closest('.item_cart').remove();
    updatePrice();
}