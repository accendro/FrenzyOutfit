const DATA_URL = './products.json';

        const API_URL = "https://script.google.com/macros/s/AKfycbyjNqmuPwJawaLPP4fm6JImQcngpg30FfSE6_SNUgeG6nchRMMG4u5fVjprCBX069mbxg/exec";

const facebookPageUsername = "FrenzyOutfitBD";

const LOC_INSIDE = "Inside Dhaka"; 

const FEE_INSIDE = 100;

const LOC_OUTSIDE = "Outside Dhaka";
const FEE_OUTSIDE = 150;

const LINK_FACEBOOK = "https://www.facebook.com/FrenzyOutfitBD/";
const LINK_YOUTUBE = "https://youtube.com/@frenzy_outfit?si=VY--_UGZFaagTCGb";
const LINK_TIKTOK = "https://vm.tiktok.com/ZS9LT4vGeVd42-5qyhs/";
const LINK_PHONE = "01816161221";
const LINK_EMAIL = "frenzyoutfit2427@gmail.com";
const LINK_MAPS = "https://maps.app.goo.gl/y5BM77qVfFkp5GqV6?g_st=aw";

async function getProducts() {
    try {

        const cacheBusterUrl = DATA_URL + '?v=' + new Date().getTime();
        const response = await fetch(cacheBusterUrl);
        let rawData = await response.json();

        let seenIds = new Set(); 

        let cleanData = rawData.map((p, index) => {

            p.id = p.id ? String(p.id).trim() : `auto-id-${index}`;

            if (seenIds.has(p.id)) {
                console.warn(`Duplicate ID detected: ${p.id}. Auto-fixing to prevent crash.`);
                p.id = `${p.id}-dup-${index}`; 
            }
            seenIds.add(p.id); 

            if (typeof p.images === 'string') p.images = p.images.split(',').map(i => i.trim()).filter(i => i !== "");
            else if (!p.images || !Array.isArray(p.images) || p.images.length === 0) p.images =["https://via.placeholder.com/400?text=No+Image"];

            if (typeof p.sizes === 'string') p.sizes = p.sizes.split(',').map(s => s.trim()).filter(s => s !== "");
            else p.sizes =[];

            if (typeof p.tags === 'string') p.tags = p.tags.split(',').map(t => t.trim()).filter(t => t !== "");
            else p.tags =[];

            if (typeof p.keywords === 'string') p.keywords = p.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k !== "");
            else p.keywords =[];

            if (typeof p.colors === 'string' && p.colors.trim() !== "") {
                p.colors = p.colors.split(',').map(c => {
                    let parts = c.split('|');
                    let colorName = parts[0] ? parts[0].trim() : "Default";
                    let imgUrl = parts[1] ? parts[1].trim() : "";
                    let colorPrice = parts[2] && !isNaN(parseInt(parts[2])) ? parseInt(parts[2].trim()) : null;
                    if (imgUrl.startsWith("urlhttp")) imgUrl = imgUrl.replace("urlhttp", "http");
                    return { name: colorName, img: imgUrl, price: colorPrice };
                });
            } else { p.colors =[]; }

            p.show_sold = (p.show_sold === "TRUE" || p.show_sold === true);
            p.sold = parseInt(p.sold) || 0;
            p.price = parseInt(p.price) || 0;
            if (p.original_price === "") p.original_price = null; else p.original_price = parseInt(p.original_price);
            p.in_stock = (p.in_stock === "FALSE" || p.in_stock === false) ? false : true;

            return p;
        });

        return cleanData;

    } catch (error) { 
        console.error("Error fetching products:", error); 
        return []; 
    }
}

function getTypoDistance(a, b) {
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 
    let matrix =[];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

function isCloseMatch(typedWord, databaseString) {
    if (databaseString.includes(typedWord)) return true; 

    let dbWords = databaseString.split(/[\s,\|-]+/); 
    for (let dbWord of dbWords) {

        if (Math.abs(dbWord.length - typedWord.length) <= 2 && typedWord.length > 3) {
            let typos = getTypoDistance(dbWord, typedWord);
            if (typos <= 2) return true; 

        }
    }
    return false;
}

function getUrlParam(param) { return new URLSearchParams(window.location.search).get(param); }
function getCart() { const c = localStorage.getItem('my_cart'); return c ? JSON.parse(c) :[]; }

function addToCart(product, variant) {
    let cart = getCart();
    let exist = cart.find(i => i.product.id === product.id && i.variant.color.name === variant.color.name && i.variant.size === variant.size);
    if (exist) exist.variant.qty += variant.qty;
    else cart.push({ product, variant });

    localStorage.setItem('my_cart', JSON.stringify(cart));
    updateCartIcon();
}

function updateCartIcon() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.variant.qty, 0);

    document.querySelectorAll('.cart-badge').forEach(badge => {
        if(totalItems > 0) {
            badge.style.display = 'inline-block';
            badge.innerText = totalItems;
        } else {
            badge.style.display = 'none';
        }
    });
}

let toastTimeout;
function showToast(message, isSuccess = true) {
    let toast = document.getElementById('global-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        document.body.appendChild(toast);
    }

    clearTimeout(toastTimeout); 

    toast.className = 'toast-notification'; 
    toast.style.transform = ''; 

    const icon = isSuccess 
        ? '<i class="ri-checkbox-circle-fill" style="color:#4cd137; font-size: 45px; line-height:1;"></i>' 
        : '<div style="background:var(--primary); color:white; width: 45px; height: 45px; display:flex; justify-content:center; align-items:center; border-radius:50%; font-size:24px; font-weight:bold;">!</div>';

    toast.innerHTML = `${icon} <div style="font-weight:500;">${message}</div>`;

    void toast.offsetWidth;
    toast.classList.add('show');

    let startX = 0;
    toast.ontouchstart = (e) => { startX = e.touches[0].clientX; };
    toast.ontouchend = (e) => {
        let diffX = e.changedTouches[0].clientX - startX;

        if (Math.abs(diffX) > 40) toast.classList.remove('show');
    };

    toast.onclick = () => toast.classList.remove('show');

    toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function openMessenger() {
    const currentUrl = window.location.href;

    let message = `#WebOrder\n\nহ্যালো! আমি আপনাদের ওয়েবসাইট থেকে এই পেজটি দেখছি:\n${currentUrl}`;
    let refParam = 'website_home';

    if (currentUrl.includes('thankyou.html')) {
        const orderId = localStorage.getItem('last_order_id');
        if (orderId) {
            message = `#WebOrder\n\nহ্যালো! আমি এইমাত্র একটি অর্ডার করেছি।\nআমার অর্ডার আইডি: ${orderId}\n\nআমি আমার অর্ডার সম্পর্কে কিছু জানতে চাচ্ছি।`;
            refParam = `order_${orderId}`;
        }
    }

    else if (currentUrl.includes('checkout.html')) {
        const cartText = localStorage.getItem('my_cart');
        if (cartText) {
            const cart = JSON.parse(cartText);
            if (cart.length > 0) {

                const baseUrl = currentUrl.split('checkout.html')[0];

                let itemsList = cart.map(item => {
                    let productLink = `${baseUrl}product.html?id=${item.product.id}`;
                    return `- ${item.product.name} (Qty: ${item.variant.qty})\n  লিংক: ${productLink}`;
                }).join('\n\n');

                message = `#WebOrder\n\nহ্যালো! আমি চেকআউট পেজে আছি এবং এই প্রোডাক্টগুলো নিতে চাচ্ছি:\n\n${itemsList}`;
                refParam = 'checkout_page';
            }
        }
    }

    else {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId && typeof currentProduct !== 'undefined' && currentProduct) {
            message = `#WebOrder\n\nহ্যালো! আমি ওয়েবসাইটের এই প্রোডাক্টটি নিতে চাচ্ছি:\n${currentProduct.name}\n\nলিংক: ${currentUrl}`;
            refParam = `prod_${productId}`;
        }
    }

    let textArea = document.createElement("textarea");
    textArea.value = message;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        if (typeof showToast === 'function') {
            showToast("Message copied! Please PASTE it in the chat.", true);
        }
    } catch (err) {
        console.log("Copy to clipboard failed.");
    }
    document.body.removeChild(textArea);

    setTimeout(() => {
        window.location.href = `https://m.me/${facebookPageUsername}?ref=${refParam}`;
    }, 400);
}

document.addEventListener('DOMContentLoaded', updateCartIcon);