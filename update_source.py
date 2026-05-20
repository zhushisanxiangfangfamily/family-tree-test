import sys

path = r"C:\Users\29763\Desktop\朱氏三厢房家族族谱\上传版本\族谱.html"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

changes = 0

# 1. Modal: change birth label + add death/age rows
old = '<div class="modal-row"><span class="modal-label">出生日期</span><span class="modal-value" id="m-birth">'
new = '<div class="modal-row"><span class="modal-label">生于</span><span class="modal-value" id="m-birth">'
if old in html:
    html = html.replace(old, new)
    pos = html.index(new)
    end_pos = html.index("</div>", html.index('id="m-birth"', pos)) + 6
    extra = '\n    <div class="modal-row" id="m-death-row" style="display:none"><span class="modal-label">卒于</span><span class="modal-value" id="m-death">—</span></div>\n    <div class="modal-row" id="m-age-row" style="display:none"><span class="modal-label">享年</span><span class="modal-value" id="m-age">—</span></div>'
    html = html[:end_pos] + extra + html[end_pos:]
    changes += 1
    print("1. Modal updated")
else:
    print("1. Modal pattern not found, searching for partial...")
    if 'id="m-birth"' in html:
        print("   m-birth found")
    if '出生日期' in html:
        print("   出生日期 found")
    else:
        print("   出生日期 NOT found - already changed?")

# 2. Form: add death date fields after job field
old_form = '<div class="form-group"><label class="form-label">职业</label>\n      <input class="form-input" id="mf-job" placeholder="例：教师"></div>\n    <div class="form-group" id="mf-parent-group"'
if old_form in html:
    new_form = '<div class="form-group"><label class="form-label">职业</label>\n      <input class="form-input" id="mf-job" placeholder="例：教师"></div>\n    <div class="form-row">\n      <div class="form-group"><label class="form-label">去世日期 <span style="color:var(--text-light);font-size:.75rem">（选填）</span></label>\n        <div style="display:flex;gap:4px;align-items:center">\n          <input class="form-input" id="mf-death-year" placeholder="年" style="flex:1" type="number" min="1000" max="2026" inputmode="numeric">\n          <span style="color:var(--text-light);font-size:.8rem">年</span>\n          <select class="form-select" id="mf-death-month" style="flex:0.8">\n            <option value="">月</option>\n          <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select>\n          <span style="color:var(--text-light);font-size:.8rem">月</span>\n          <select class="form-select" id="mf-death-day" style="flex:0.8"><option value="">日</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option></select>\n          <span style="color:var(--text-light);font-size:.8rem">日</span>\n        </div></div>\n      <div class="form-group"></div>\n    </div>\n    <div class="form-group" id="mf-parent-group"'
    html = html.replace(old_form, new_form)
    changes += 1
    print("2. Form updated")
else:
    print("2. Form pattern not found")
    # Check if already updated
    if '去世日期' in html:
        print("   去世日期 already exists")
    if 'mf-job' in html:
        print("   mf-job found")

# 3. JS: Add death helpers
old_js = '  return null;\n}\n\n// ===== KINSHIP ENGINE ====='
if old_js in html:
    new_js = '''  return null;
}

// ===== DEATH DATE HELPERS =====
function parseDeathDate(death) {
  if (!death) return {year:"", month:"", day:""};
  var m = death.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})$/);
  if (m) return {year:m[1], month:m[2], day:m[3]};
  m = death.match(/^(\\d{4})年/);
  if (m) return {year:m[1], month:"", day:""};
  m = death.match(/^(\\d{4})/);
  if (m) return {year:m[1], month:"", day:""};
  return {year:death, month:"", day:""};
}
function formatDeath(death) {
  if (!death) return "";
  var d = parseDeathDate(death);
  if (d.year && d.month && d.day) return d.year + "年" + d.month + "月" + d.day + "日";
  if (d.year) return d.year + "年";
  return death;
}
function setDeathFields(death) {
  var d = parseDeathDate(death);
  document.getElementById("mf-death-year").value = d.year;
  if (d.month) {
    document.getElementById("mf-death-month").value = parseInt(d.month);
  } else {
    document.getElementById("mf-death-month").value = "";
  }
  if (d.day) {
    document.getElementById("mf-death-day").value = parseInt(d.day);
  } else {
    document.getElementById("mf-death-day").value = "";
  }
}
function getDeathValue() {
  var y = document.getElementById("mf-death-year").value.trim();
  var m = document.getElementById("mf-death-month").value;
  var d = document.getElementById("mf-death-day").value;
  if (!y) return "";
  if (m && d) return y + "-" + m.padStart(2,"0") + "-" + d.padStart(2,"0");
  if (m) return y + "-" + m.padStart(2,"0");
  return y;
}
function calcAge(birth, death) {
  if (!birth || !death) return "";
  var b = parseBirthDate(birth);
  var d = parseDeathDate(death);
  if (!b.year || !d.year) return "";
  var age = parseInt(d.year) - parseInt(b.year);
  if (age < 0) return "";
  if (d.month && b.month) {
    if (parseInt(d.month) < parseInt(b.month)) age--;
    else if (parseInt(d.month) === parseInt(b.month) && d.day && b.day && parseInt(d.day) < parseInt(b.day)) age--;
  }
  return age + "岁";
}

// ===== KINSHIP ENGINE ====='''
    html = html.replace(old_js, new_js)
    changes += 1
    print("3. JS helpers added")
else:
    print("3. JS pattern not found")
    if 'calcAge' in html:
        print("   calcAge already exists")
    if 'KINSHIP ENGINE' in html:
        print("   KINSHIP ENGINE found")

# 4. Update openMemberDetail
old_detail = "  document.getElementById('m-birth').textContent=formatBirth(m.birth);\n  document.getElementById('m-origin').textContent=m.origin||'—';"
if old_detail in html:
    new_detail = """  document.getElementById('m-birth').textContent=formatBirth(m.birth);
  // Death date and age
  var deathRow = document.getElementById('m-death-row');
  var ageRow = document.getElementById('m-age-row');
  if (m.death) {
    document.getElementById('m-death').textContent = formatDeath(m.death);
    deathRow.style.display = 'flex';
    var ageText = calcAge(m.birth, m.death);
    if (ageText) {
      document.getElementById('m-age').textContent = ageText;
      ageRow.style.display = 'flex';
    } else {
      ageRow.style.display = 'none';
    }
  } else {
    deathRow.style.display = 'none';
    ageRow.style.display = 'none';
  }
  document.getElementById('m-origin').textContent=m.origin||'—';"""
    html = html.replace(old_detail, new_detail)
    changes += 1
    print("4. openMemberDetail updated")
else:
    print("4. openMemberDetail pattern not found")
    if "formatBirth(m.birth)" in html:
        print("   formatBirth found")

# 5a. saveMember edit
old_s1 = '        bio: document.getElementById("mf-bio").value,\n        photo\n      };\n    }\n    showToast("已更新族人信息","success");'
if old_s1 in html:
    new_s1 = '        bio: document.getElementById("mf-bio").value,\n        death: getDeathValue(),\n        photo\n      };\n    }\n    showToast("已更新族人信息","success");'
    html = html.replace(old_s1, new_s1)
    changes += 1
    print("5a. saveMember edit updated")
else:
    print("5a. saveMember edit not found")

# 5b. saveMember spouse
old_s2 = '      bio: document.getElementById("mf-bio").value,\n      photo,\n      parentId: null,'
if old_s2 in html:
    new_s2 = '      bio: document.getElementById("mf-bio").value,\n      death: getDeathValue(),\n      photo,\n      parentId: null,'
    html = html.replace(old_s2, new_s2)
    changes += 1
    print("5b. saveMember spouse updated")
else:
    print("5b. saveMember spouse not found")

# 5c. saveMember child
old_s3 = '      bio: document.getElementById("mf-bio").value,\n      photo,\n      parentId: parentId || null,'
if old_s3 in html:
    new_s3 = '      bio: document.getElementById("mf-bio").value,\n      death: getDeathValue(),\n      photo,\n      parentId: parentId || null,'
    html = html.replace(old_s3, new_s3)
    changes += 1
    print("5c. saveMember child updated")
else:
    print("5c. saveMember child not found")

# 6. openMemberForm setDeathFields
old_fset = "    setBirthFields(m.birth);\n    document.getElementById('mf-origin').value=m.origin||'';"
if old_fset in html:
    new_fset = "    setBirthFields(m.birth);\n    setDeathFields(m.death||'');\n    document.getElementById('mf-origin').value=m.origin||'';"
    html = html.replace(old_fset, new_fset)
    changes += 1
    print("6. openMemberForm updated")
else:
    print("6. openMemberForm pattern not found")

# 7. Clear death in spouse form
old_cl1 = "    setBirthFields('');\n    document.getElementById('mf-origin').value='';\n    document.getElementById('mf-job').value='';\n    document.getElementById('mf-bio').value='';\n    document.getElementById('mf-parent-group').style.display='none';\n  } else {\n    // child or new root"
if old_cl1 in html:
    new_cl1 = "    setBirthFields('');\n    setDeathFields('');\n    document.getElementById('mf-origin').value='';\n    document.getElementById('mf-job').value='';\n    document.getElementById('mf-bio').value='';\n    document.getElementById('mf-parent-group').style.display='none';\n  } else {\n    // child or new root"
    html = html.replace(old_cl1, new_cl1)
    changes += 1
    print("7. Spouse form cleared")
else:
    print("7. Spouse clear pattern not found")

# 8. Clear death in child form (first occurrence only since spouse was already handled)
old_cl2 = "    setBirthFields('');\n    document.getElementById('mf-origin').value='';\n    document.getElementById('mf-job').value='';\n    document.getElementById('mf-bio').value='';"
if old_cl2 in html:
    html = html.replace(old_cl2, "    setBirthFields('');\n    setDeathFields('');\n    document.getElementById('mf-origin').value='';\n    document.getElementById('mf-job').value='';\n    document.getElementById('mf-bio').value='';", 1)
    changes += 1
    print("8. Child form cleared")
else:
    print("8. Child clear pattern not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\nTotal changes: {changes}")
