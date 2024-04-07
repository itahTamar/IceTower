// Object: index.ts file
//-----hendels----------------------------
function hendleLogIn(ev) {
    try {
        ev.preventDefault();
        var username = ev.target.username.value;
        if (!username) {
            throw new Error("cant find username");
        }
        else {
            // save username in local storage
            localStorage.setItem('username', username);
            // redirect to chat page
            window.location.href = '/main/canvas.html';
        }
    }
    catch (error) {
        console.error(error);
    }
}
//move to scoreboard.html  --> need to be at the controlers files (canvas.ts)
function showScoreboard() {
    window.location.href = '/main/scoreboard.html';
}
//mouse shadow at login page
var cursorShadow = document.getElementById("cursorShadow");
// Update the cursor shadow position on mousemove
document.addEventListener("mousemove", function (event) {
    var clientX = event.clientX, clientY = event.clientY;
    cursorShadow.style.left = clientX + "px";
    cursorShadow.style.top = clientY + "px";
});
