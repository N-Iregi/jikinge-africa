// db/database.js
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const DB_PATH = path.join(__dirname, "jikinge.db");
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'user',
      mfa_secret  TEXT,
      level       TEXT NOT NULL DEFAULT 'Beginner',
      points      INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      last_login  TEXT
    );

    CREATE TABLE IF NOT EXISTS modules (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      tag         TEXT NOT NULL,
      category    TEXT NOT NULL,
      duration    TEXT NOT NULL,
      difficulty  TEXT NOT NULL,
      xp          INTEGER NOT NULL DEFAULT 100,
      description TEXT NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id          TEXT PRIMARY KEY,
      module_id   INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title       TEXT NOT NULL,
      type        TEXT NOT NULL CHECK(type IN ('theory','lab')),
      duration    TEXT NOT NULL,
      content     TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id   INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      question    TEXT NOT NULL,
      options     TEXT NOT NULL,
      answer      INTEGER NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id                TEXT PRIMARY KEY,
      user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id         INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      completed         INTEGER NOT NULL DEFAULT 0,
      quiz_score        INTEGER,
      xp_earned         INTEGER NOT NULL DEFAULT 0,
      completed_lessons TEXT NOT NULL DEFAULT '[]',
      started_at        TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at      TEXT,
      UNIQUE(user_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS incident_reports (
      id          TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      description TEXT NOT NULL,
      severity    TEXT NOT NULL CHECK(severity IN ('Low','Medium','High','Critical')),
      status      TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Under Review','Resolved')),
      location    TEXT NOT NULL DEFAULT 'Not specified',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_by TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    TEXT REFERENCES users(id),
      action     TEXT NOT NULL,
      detail     TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedData(db);
  console.log("✅ Database initialised:", DB_PATH);
  return db;
}

function seedData(db) {
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  if (userCount > 0) return;
  console.log("🌱 Seeding initial data...");

  const speakeasy = require("speakeasy");
  const { v4: uuidv4 } = require("uuid");

  const hp = bcrypt.hashSync("Demo1234!", 12);
  const ha = bcrypt.hashSync("Admin1234!", 12);
  const secret1 = speakeasy.generateSecret({ name: "JikingeAfrica (demo@alu.edu)" });
  const secret2 = speakeasy.generateSecret({ name: "JikingeAfrica (admin@jikinge.africa)" });

  const ins = db.prepare("INSERT INTO users (id,name,email,password,role,mfa_secret,level,points) VALUES (?,?,?,?,?,?,?,?)");
  ins.run("user-001","Neville Iregi","demo@alu.edu",hp,"user",secret1.base32,"Intermediate",340);
  ins.run("admin-001","Admin User","admin@jikinge.africa",ha,"admin",secret2.base32,"Admin",0);

  const im = db.prepare("INSERT INTO modules (title,tag,category,duration,difficulty,xp,description) VALUES (?,?,?,?,?,?,?)");
  const m1 = im.run("Phishing Awareness","SOCIAL ENGINEERING","Social Engineering","25 min","Beginner",100,"Identify and neutralise phishing attacks — the leading cyber threat vector across Africa.").lastInsertRowid;
  const m2 = im.run("Authentication & Passwords","ACCESS CONTROL","Authentication","20 min","Beginner",80,"Design robust authentication practices and implement multi-factor verification.").lastInsertRowid;
  const m3 = im.run("Malware & Ransomware","MALICIOUS SOFTWARE","Malware","30 min","Intermediate",120,"Understand malware propagation vectors and implement effective defensive postures.").lastInsertRowid;
  const m4 = im.run("Online Fraud & Social Engineering","FRAUD AWARENESS","Online Safety","22 min","Beginner",90,"Recognise advance fee fraud, mobile money scams, and digital sextortion tactics.").lastInsertRowid;

  const il = db.prepare("INSERT INTO lessons (id,module_id,title,type,duration,content,order_index) VALUES (?,?,?,?,?,?,?)");
  il.run("1a",m1,"What is Phishing?","theory","8 min","Phishing is a social engineering attack where adversaries impersonate trusted entities to extract sensitive credentials, financial information, or system access.\n\n**Attack Mechanics**\nAdversaries craft convincing communications that appear to originate from legitimate institutions. Victims are directed to spoofed interfaces where credentials are harvested silently.\n\n**African Threat Landscape**\nPhishing accounts for the majority of reported cybercrimes across East and West Africa. Common impersonation targets include M-Pesa, Equity Bank, KRA (Kenya), SARS (South Africa), and government e-services portals.\n\n**Indicators of Compromise**\n- Sender domain mismatch (e.g. kra-refund@gmail.com vs official @kra.go.ke)\n- Urgency framing designed to suppress critical thinking\n- Requests for credentials, PINs, or OTP codes\n- Redirect URLs that do not match the purported organisation",0);
  il.run("1b",m1,"Phishing Variants","theory","10 min","**Spear Phishing**\nHighly targeted attacks built around OSINT gathered from social media and public records.\n\n**Smishing**\nSMS-based phishing. Prevalence is elevated across Africa due to high mobile penetration.\n\n**Vishing**\nVoice phishing via phone calls. Attackers impersonate bank fraud departments or government agencies.\n\n**Business Email Compromise (BEC)**\nAdversaries compromise or spoof executive email accounts to authorise fraudulent wire transfers.\n\n**Clone Phishing**\nLegitimate emails are duplicated with malicious links substituted for authentic ones.",1);
  il.run("1c",m1,"Detection Lab","lab","7 min","INTERACTIVE_LAB",2);

  il.run("2a",m2,"Why Passwords Fail","theory","6 min","Passwords remain the primary authentication mechanism yet represent the weakest link in most security architectures.\n\n**Systemic Vulnerabilities**\nWeak credential selection persists because users optimise for memorability over entropy. Dictionary words, birth years, and sequential patterns remain dominant.\n\nCredential reuse across services means a single breach propagates access across an entire digital identity.\n\n**Statistical Reality**\n'123456' remains the most frequently used password globally, present in hundreds of millions of breach records.",0);
  il.run("2b",m2,"Strong Credential Design","theory","7 min","**Minimum Viable Strength**\nA secure password requires a minimum of 12 characters combining uppercase, lowercase, numerals, and symbols. No dictionary words. No personal identifiers.\n\n**Passphrases**\nA sequence of random unrelated words provides both high entropy and memorability. 'Copper-Baobab-Rainfall-47' is computationally stronger than 'P@ssw0rd1'.\n\n**Password Managers**\nBitwarden (open source, free) and similar tools generate and store unique high-entropy credentials per service.\n\n**Operational Rules**\n- Never disclose credentials to any party, including IT support\n- Rotate credentials immediately upon any suspected compromise\n- Never use the same credential across two services",1);
  il.run("2c",m2,"MFA Configuration Lab","lab","7 min","INTERACTIVE_LAB",2);

  il.run("3a",m3,"Malware Taxonomy","theory","10 min","Malware encompasses all software designed to compromise, damage, or gain unauthorised access to systems.\n\n**Ransomware**\nEncrypts victim files and demands payment for decryption keys. African healthcare systems have seen an 80% increase in ransomware incidents since 2022.\n\n**Trojans**\nMasquerade as legitimate software to establish persistent access. Often delivered via pirated software.\n\n**Spyware**\nOperates silently, exfiltrating keystrokes, screenshots, and stored credentials.\n\n**Worms**\nSelf-replicating code that propagates across networks without user interaction.\n\n**Adware**\nFrequently bundled with free software and often serves as a delivery mechanism for more destructive payloads.",0);
  il.run("3b",m3,"Prevention & Incident Response","theory","12 min","**Preventive Controls**\nKeep all operating systems and software patched. Unpatched vulnerabilities are the primary initial access vector for the majority of malware campaigns.\n\nMaintain current antivirus and endpoint detection software. Source software exclusively from verified publishers.\n\nImplement a 3-2-1 backup strategy: three copies of data, two different media types, one stored offline.\n\n**Incident Response Protocol**\n1. Isolate — disconnect the affected system from all networks immediately\n2. Contain — prevent lateral movement to other systems\n3. Do not pay ransoms — payment does not guarantee recovery\n4. Notify — report to your security team and relevant authorities\n5. Recover — restore from clean, verified backups\n6. Document — record the full incident timeline for analysis",1);
  il.run("3c",m3,"Incident Response Drill","lab","8 min","INTERACTIVE_LAB",2);

  il.run("4a",m4,"Social Media Attack Surface","theory","8 min","Social media profiles constitute a rich intelligence source for adversaries conducting targeted social engineering attacks.\n\n**Reconnaissance Value**\nPublicly available information — employer, location, family names, travel patterns — provides raw material for personalised attacks.\n\n**Digital Sextortion**\nA rapidly escalating threat across East Africa. Adversaries obtain intimate imagery through deception and coerce victims financially. Interpol classifies this among the fastest-growing cybercrime categories on the continent.\n\n**Romance Fraud**\nLong-duration social engineering operations where adversaries cultivate trust over weeks before introducing financial requests.",0);
  il.run("4b",m4,"Fraud Pattern Recognition","theory","8 min","**Advance Fee Fraud (419)**\nVictims are promised substantial returns contingent on an initial processing payment. The promised sum never materialises.\n\n**Mobile Money Fraud**\nHighly prevalent across East Africa. Common variants include:\n- Fake M-Pesa reversal requests soliciting OTP codes\n- Impersonation of Safaricom or Airtel customer service\n- Fraudulent wrong-transfer scenarios requiring the victim to send funds\n\n**Universal Warning Indicators**\n- Any request for upfront payment in exchange for a promised benefit\n- Artificial time pressure designed to prevent deliberation\n- Requests for OTP codes, PINs, or login credentials",1);
  il.run("4c",m4,"Fraud Recognition Lab","lab","6 min","INTERACTIVE_LAB",2);

  const iq = db.prepare("INSERT INTO quiz_questions (module_id,question,options,answer,order_index) VALUES (?,?,?,?,?)");
  // Module 1
  iq.run(m1,"Which characteristic most reliably identifies a phishing email?",JSON.stringify(["The email contains a company logo","The sender domain does not match the claimed organisation","The email was marked as important","The email arrived outside business hours"]),1,0);
  iq.run(m1,"Smishing refers to phishing conducted via:",JSON.stringify(["Email","SMS messages","Voice calls","Social media direct messages"]),1,1);
  iq.run(m1,"You receive an email from 'KRA-Tax@gmail.com' demanding you claim a refund. Correct response:",JSON.stringify(["Click the link to verify eligibility","Reply requesting more information","Report as phishing and delete without clicking","Forward to colleagues to warn them"]),2,2);
  iq.run(m1,"Business Email Compromise primarily targets:",JSON.stringify(["Personal social media accounts","Gaming platforms","Organisational financial processes and wire transfers","Consumer banking portals"]),2,3);
  // Module 2
  iq.run(m2,"Which credential demonstrates the highest entropy?",JSON.stringify(["Password123","neville1998","Tr0pic@l-Savanna-99!","qwerty"]),2,0);
  iq.run(m2,"Credential stuffing attacks function by:",JSON.stringify(["Generating random passwords algorithmically","Testing breached credentials from one service against other services","Intercepting credentials in transit","Social engineering help desk staff"]),1,1);
  iq.run(m2,"Multi-factor authentication requires:",JSON.stringify(["Two different passwords","A password and at least one additional verification factor","Biometric data only","A hardware security key only"]),1,2);
  iq.run(m2,"A password manager mitigates risk by:",JSON.stringify(["Encrypting your email communications","Eliminating credential reuse through unique generated passwords per service","Blocking phishing websites automatically","Bypassing MFA requirements"]),1,3);
  // Module 3
  iq.run(m3,"Ransomware's primary impact on victim systems is:",JSON.stringify(["Accelerating system performance","Encrypting files and demanding payment for decryption","Displaying unwanted advertisements","Blocking social media access"]),1,0);
  iq.run(m3,"The safest source for software installation is:",JSON.stringify(["Torrent indexing sites","Third-party download aggregators","The official developer or vendor website","Email attachments from colleagues"]),2,1);
  iq.run(m3,"Upon discovering a ransomware infection, the immediate priority is:",JSON.stringify(["Pay the ransom to restore operations quickly","Continue working to complete critical tasks first","Disconnect the affected system from all networks","Install additional antivirus software"]),2,2);
  iq.run(m3,"Which practice most effectively reduces ransomware recovery time?",JSON.stringify(["Maintaining up-to-date offline backups","Keeping the ransom payment ready","Using the same password across fewer accounts","Disabling automatic updates"]),0,3);
  // Module 4
  iq.run(m4,"Digital sextortion involves:",JSON.stringify(["Hacking gaming accounts for virtual currency","Coercing victims financially using intimate imagery as leverage","Distributing pirated video content","Intercepting video calls"]),1,0);
  iq.run(m4,"An unsolicited message promising $50,000 if you first send $500 is classified as:",JSON.stringify(["A legitimate investment opportunity","Advance fee fraud","A government grant programme","A bank promotional offer"]),1,1);
  iq.run(m4,"Which characteristic most reliably indicates a fraudulent proposition?",JSON.stringify(["A clearly stated refund policy","Demand for immediate action before the offer expires","A verified seller badge from the platform","Payment processed through a secure checkout"]),1,2);
  iq.run(m4,"Mobile money fraud in East Africa most commonly involves:",JSON.stringify(["Legitimate interbank transfer errors","Fabricated reversal requests designed to obtain OTP codes","Official government disbursements","Standard airtime purchase confirmations"]),1,3);

  const ir = db.prepare("INSERT INTO incident_reports (id,reporter_id,type,description,severity,status,location,created_at) VALUES (?,?,?,?,?,?,?,?)");
  ir.run(uuidv4(),"user-001","Phishing Email","Email purportedly from ALU IT requesting login credential verification. Sender domain: alu-it@gmail.com (non-institutional).","High","Under Review","Kigali, Rwanda","2026-01-22 08:00:00");
  ir.run(uuidv4(),"user-001","Mobile Money Fraud","WhatsApp message claiming M-Pesa reversal required. Victim solicited for OTP disclosure.","Critical","Resolved","Nairobi, Kenya","2026-01-20 14:30:00");
  ir.run(uuidv4(),"user-001","Suspicious Redirect","LinkedIn message containing link purporting to offer cybersecurity employment. URL resolves to unregistered domain.","Medium","Pending","Kigali, Rwanda","2026-01-25 10:15:00");

  console.log("✅ Seed data inserted.");
}

module.exports = { getDb, initDb };
