/* ***********************************
 * Unit 4, Deliver Registration View activity
 * Show/Hide Password
 * ****************************** */

const pswdBtn = document.querySelector("#pswdBtn")
pswdBtn.addEventListener("click", function () {
  let pswdInput = document.getElementById("password")
  let type = pswdInput.getAttribute("type")
  if (type == "password") {
    pswdInput.setAttribute("type", "text")
    pswdBtn.innerHTML = "Hide Password"
  } else {
    pswdInput.setAttribute("type", "password")
    pswdBtn.innerHTML = "Show Password"
  }
})
