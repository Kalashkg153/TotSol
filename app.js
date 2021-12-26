
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "9f301vl7ht2p",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "5ZND93sU48bbK4GgRK64lLXgYSNOBEB_qxuc_YpS4oY"
  });


const cartbtn = document.querySelector('.cart-btn');
const closecartbtn = document.querySelector('.close-cart');
const clearcartbtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartoverlay = document.querySelector('.cart-overlay');
const cartitems = document.querySelector('.cart-items');
const carttotal = document.querySelector('.cart-total');
const cartcontent = document.querySelector('.cart-content');
const productDOM = document.querySelector(".products-center");

const btns = document.querySelectorAll(".bag-btn");
let cart = [];
let buttonsDOM = [];

class Products{
    async getProducts(){
        try{
            let contentful = await client.getEntries(
                {
                    content_type : "totSolproducts"
                }
            );

            //let result = await fetch('products.json')
            //let data = await result.json();
            let products = contentful.items;
            products = products.map(item=>{
                const{title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        }catch (error){
            console.log(error);
        }
      
    }
}

class UI{

    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <div>
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} 
                    alt="product" 
                    class="product-img"/>
                        <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                     add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article> 
            </div>
            `;
        });
        productDOM.innerHTML = result;
    }
    getBagButtons()
    {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let incart = cart.find(item=> item.id === id);
            if(incart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            else{
                button.addEventListener('click', (event)=>{
                    event.target.innerText= "In Cart";
                    event.target.disabled = true;

                    let cartItem = {...Storage.getProduct(id),amount : 1};

                    cart = [...cart,cartItem];

                    Storage.saveCart(cart)
                    
                    this.setCartValues(cart);
                    this.addCartItems(cartItem);
                    this.showCart()

                });
            }
        })
    }
    setCartValues(cart){
        let tempTotal= 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        carttotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartitems.innerText = itemsTotal;

    }

    addCartItems(item)
    {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = ` <img src="./images/product-1.jpeg" alt="product" srcset="">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id} ></i>
        </div>`;
        cartcontent.appendChild(div);

    }
    showCart(){
        cartoverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartbtn.addEventListener("click",this.showCart);
        closecartbtn.addEventListener("click",this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItems(item));

    }
    hideCart(){
        cartoverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic(){
        clearcartbtn.addEventListener("click",()=>{
            this.clearCart();
        });

        cartcontent.addEventListener('click',event=>{
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartcontent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
                
            }
            else if(event.target.classList.contains("fa-chevron-up"))
            {
                let addamount = event.target;
                let id= addamount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addamount.nextElementSibling.innerText = tempItem.amount
            }
            else if(event.target.classList.contains("fa-chevron-down"))
            {
                let lowamount = event.target;
                let id= lowamount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0)
                {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowamount.previousElementSibling.innerText = tempItem.amount
                }
                else{
                    cartcontent.removeChild(lowamount.parentElement.parentElement);
                    this.removeItem(id);
                }
               
            }

            });
    }
    clearCart(){
        let cartitems = cart.map(item => item.id);
        cartitems.forEach(id => this.removeItem(id));
        console.log(cartcontent.children);
        while(cartcontent.children.length>0){
            cartcontent.removeChild(cartcontent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

class Storage{

    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products=JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id )
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener("DOMContentLoaded" , ()=>{
    const ui = new UI()
    const products = new Products();
    ui.setupApp();
    products.getProducts().then(products => {ui.displayProducts(products);
    Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});