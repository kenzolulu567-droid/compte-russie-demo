const express=require("express");
const path=require("path");
const Database=require("better-sqlite3");
const app=express(),PORT=process.env.PORT||3000,ADMIN_KEY=process.env.ADMIN_KEY||"change-me";
const db=new Database("compte-russie.db"); db.pragma("journal_mode=WAL");
db.exec(`CREATE TABLE IF NOT EXISTS requests(id INTEGER PRIMARY KEY AUTOINCREMENT,first TEXT NOT NULL,last TEXT NOT NULL,email TEXT NOT NULL,username TEXT NOT NULL UNIQUE,country TEXT NOT NULL,city TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'En attente',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),whatsapp TEXT NOT NULL DEFAULT '+237 690 020 387',email TEXT NOT NULL DEFAULT '',hours TEXT NOT NULL DEFAULT 'Lun–Ven, 09:00–18:00');
INSERT OR IGNORE INTO settings(id) VALUES(1);`);
app.use(express.json());
function adminOnly(req,res,next){if(req.get("x-admin-key")!==ADMIN_KEY)return res.status(401).json({error:"Accès administrateur refusé"});next();}
app.post("/api/requests",(req,res)=>{const {first,last,email,username,country,city}=req.body||{};if(![first,last,email,username,country,city].every(v=>typeof v==="string"&&v.trim()))return res.status(400).json({error:"Tous les champs sont obligatoires"});try{const x=db.prepare("INSERT INTO requests(first,last,email,username,country,city) VALUES(?,?,?,?,?,?)").run(first.trim(),last.trim(),email.trim(),username.trim(),country.trim(),city.trim());res.json({ok:true,id:x.lastInsertRowid});}catch(e){res.status(String(e.message).includes("UNIQUE")?409:500).json({error:String(e.message).includes("UNIQUE")?"Ce nom d'utilisateur est déjà utilisé":"Erreur serveur"});}});
app.get("/api/status/:username",(req,res)=>{const x=db.prepare("SELECT username,status,created_at FROM requests WHERE username=?").get(req.params.username);if(!x)return res.status(404).json({error:"Demande introuvable"});res.json(x);});
app.get("/api/settings",(req,res)=>res.json(db.prepare("SELECT whatsapp,email,hours FROM settings WHERE id=1").get()));
app.get("/api/requests",adminOnly,(req,res)=>res.json(db.prepare("SELECT * FROM requests ORDER BY id DESC").all()));
app.patch("/api/requests/:id",adminOnly,(req,res)=>{const ok=["En attente","Approuvée","Refusée"],s=req.body?.status;if(!ok.includes(s))return res.status(400).json({error:"Statut invalide"});const x=db.prepare("UPDATE requests SET status=? WHERE id=?").run(s,req.params.id);if(!x.changes)return res.status(404).json({error:"Demande introuvable"});res.json({ok:true});});
app.put("/api/settings",adminOnly,(req,res)=>{const {whatsapp="",email="",hours=""}=req.body||{};db.prepare("UPDATE settings SET whatsapp=?,email=?,hours=? WHERE id=1").run(String(whatsapp).trim(),String(email).trim(),String(hours).trim());res.json({ok:true});});
app.use("/",express.static(path.join(__dirname,"public")));
app.use("/admin",express.static(path.join(__dirname,"admin")));
app.listen(PORT,"0.0.0.0",()=>console.log("Demo running on port "+PORT));