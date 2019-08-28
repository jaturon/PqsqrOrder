          <!--Grid column--><div class="col-lg-3 col-md-6 mb-4">
            <!--Card--><div class="card">
              <!--Card image--><div class="view overlay">
                <img src="{Image}" class="card-img-top" alt="">
                <a>
                  <div class="mask rgba-white-slight"></div>
                </a>
              </div><!--Card image-->
              <!--Card content--><div class="card-body text-center">
                <!--Category & Title-->
                <a class="grey-text">
                  <h5>{ProductType}</h5>
                </a>
                <h5>
                  <strong>
                    <a class="dark-grey-text">{ProductModel} - {ProductName}
                      <span class="badge badge-pill danger-color" onClick="addCard('{Barcode}', '{ProductName}', {Price}, '{Unit}','new');">ADD to Cart</span>
                    </a>
                  </strong>
                </h5>
                <h4 class="font-weight-bold blue-text">
                  <strong>{Price} บาท</strong>
                </h4>
              </div><!--Card content-->
            </div><!--Card-->
		</div><!--Grid Column -->
