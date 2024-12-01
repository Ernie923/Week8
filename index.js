let productData = [];


//取得產品列表
function getProduct(){
	axios.get(`${customerApiUrl}/products`)
		.then(response => {
			productData = response.data.products;
			renderProduct(productData);
		}).catch(error => {
			console.log(error);
		})
}

//畫面初始化
function initialize(){
	getProduct();
	getCart();
}
initialize();

//產品畫面渲染
const productWrap = document.querySelector('.productWrap');

function renderProduct(data){
	let str = '';
	data.forEach(item => {
		str += `<li class="productCard">
                <h4 class="productType">${item.category}</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`
	});
	productWrap.innerHTML = str;
}

//篩選產品
const productSelect = document.querySelector('.productSelect');

function filterProduct(value){
	let filterResult = [];
	productData.forEach(item => {
		if(item.category === value){
			filterResult.push(item);
			return
		}
	})
	if(value === '全部'){
		filterResult = productData;
	}
	renderProduct(filterResult);
}

productSelect.addEventListener('change', e => {
	filterProduct(e.target.value);
})

//取得購物車
const shoppingCartTableBody = document.querySelector('.shoppingCart-table tbody');
const shoppingCartTableFoot = document.querySelector('.shoppingCart-table tfoot');
const shoppingCartTableTotalPrice = document.querySelector('.shoppingCart-table tfoot .cartTotalPrice');
let addCartArr = [];

function getCart(){
  axios.get(`${customerApiUrl}/carts`)
    .then(res => {
      addCartArr = res.data.carts;
      totalPrice = res.data.total;
      renderCart(addCartArr, totalPrice);
    }).catch(err => {
      console.log(err);
    })
}

//購物車區塊渲染

//購物車渲染
function renderCart(data, price){
  let str = '';
  let totalPrice = price;
  data.forEach(item => {
    str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${item.product.origin_price}</td>
                <td>${item.quantity}</td>
                <td>NT$${item.product.origin_price * item.quantity}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-id=${item.id}>
                        clear
                    </a>
                </td>
            </tr>`;
  })

  shoppingCartTableBody.innerHTML = str;
  //購物車總金額
  shoppingCartTableTotalPrice.innerHTML = `<td class="cartTotalPrice">NT$${totalPrice}</td>`;
}

//新增購物車
productWrap.addEventListener('click', e => {
  e.preventDefault();
  addCart(e.target.dataset.id);
})

function addCart(id){
  let data = {
    "data": {
      "productId": id,
      "quantity": 2
    }
  }
  axios.post(`${customerApiUrl}/carts`, data)
  .then(res => {
    addCartArr = res.data.carts;
    getCart();
    
  }).catch(err => {
    console.log(err);
  })
}

//刪除單一商品
shoppingCartTableBody.addEventListener('click', e => {
  e.preventDefault();
  if(e.target.hasAttribute('data-id')){
    deleteSingleProduct(e.target.dataset.id);
  }
})

function deleteSingleProduct(id){
  axios.delete(`${customerApiUrl}/carts/${id}`)
    .then(res => {
      getCart();
    }).catch(err => {
      console.log(err);
    })
}

//刪除所有商品
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', e => {
  e.preventDefault();
  deleteAllProduct();
})

function deleteAllProduct(){
  axios.delete(`${customerApiUrl}/carts`)
    .then(res => {
      getCart();
    }).catch(err => {
      console.log(err);
    })
}

//送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const orderInfoForm= document.querySelector('.orderInfo-form');
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const customerTradeWay = document.querySelector('#tradeWay');
//表單欄位驗證用陣列
const checkFormArr = [customerName.value, customerPhone.value, customerEmail.value, customerAddress.value, customerTradeWay.value];


function submitOrder(cartArr){
  if(cartArr.length === 0){
    alert('購物車為空');
    orderInfoForm.reset();
    return
  }
  const customerData = {
    "data": {
      "user": {
        "name": customerName.value.trim(),
        "tel": customerPhone.value.trim(),
        "email": customerEmail.value.trim(),
        "address": customerAddress.value.trim(),
        "payment": customerTradeWay.value
      }
    }
  }
  //檢查表單是否含空值
  for (const item in customerData.data.user){
    if(customerData.data.user[item]===""){
      alert('請確認是否有填所有欄位');
      return
    }
  }
  axios.post(`${customerApiUrl}/orders`, customerData)
    .then(res => {
      console.log(res.data);
    }).catch(err => {
      console.log(err);
    })
    orderInfoForm.reset();
}

orderInfoBtn.addEventListener('click', e => {
  e.preventDefault();
  submitOrder(addCartArr);
})