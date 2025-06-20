import { app as P, BrowserWindow as x, ipcMain as v, dialog as Q } from "electron";
import { fileURLToPath as z } from "node:url";
import N from "node:path";
import O from "fs";
import { spawn as H } from "child_process";
const W = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", D = W + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040", ee = "[" + W + "][" + D + "]*", te = new RegExp("^" + ee + "$");
function q(e, t) {
  const n = [];
  let s = t.exec(e);
  for (; s; ) {
    const i = [];
    i.startIndex = t.lastIndex - s[0].length;
    const r = s.length;
    for (let f = 0; f < r; f++)
      i.push(s[f]);
    n.push(i), s = t.exec(e);
  }
  return n;
}
const R = function(e) {
  const t = te.exec(e);
  return !(t === null || typeof t > "u");
};
function ne(e) {
  return typeof e < "u";
}
const re = {
  allowBooleanAttributes: !1,
  //A tag can have attributes without any value
  unpairedTags: []
};
function se(e, t) {
  t = Object.assign({}, re, t);
  const n = [];
  let s = !1, i = !1;
  e[0] === "\uFEFF" && (e = e.substr(1));
  for (let r = 0; r < e.length; r++)
    if (e[r] === "<" && e[r + 1] === "?") {
      if (r += 2, r = Y(e, r), r.err) return r;
    } else if (e[r] === "<") {
      let f = r;
      if (r++, e[r] === "!") {
        r = X(e, r);
        continue;
      } else {
        let l = !1;
        e[r] === "/" && (l = !0, r++);
        let o = "";
        for (; r < e.length && e[r] !== ">" && e[r] !== " " && e[r] !== "	" && e[r] !== `
` && e[r] !== "\r"; r++)
          o += e[r];
        if (o = o.trim(), o[o.length - 1] === "/" && (o = o.substring(0, o.length - 1), r--), !de(o)) {
          let c;
          return o.trim().length === 0 ? c = "Invalid space after '<'." : c = "Tag '" + o + "' is an invalid name.", d("InvalidTag", c, g(e, r));
        }
        const a = le(e, r);
        if (a === !1)
          return d("InvalidAttr", "Attributes for '" + o + "' have open quote.", g(e, r));
        let u = a.value;
        if (r = a.index, u[u.length - 1] === "/") {
          const c = r - u.length;
          u = u.substring(0, u.length - 1);
          const p = Z(u, t);
          if (p === !0)
            s = !0;
          else
            return d(p.err.code, p.err.msg, g(e, c + p.err.line));
        } else if (l)
          if (a.tagClosed) {
            if (u.trim().length > 0)
              return d("InvalidTag", "Closing tag '" + o + "' can't have attributes or invalid starting.", g(e, f));
            if (n.length === 0)
              return d("InvalidTag", "Closing tag '" + o + "' has not been opened.", g(e, f));
            {
              const c = n.pop();
              if (o !== c.tagName) {
                let p = g(e, c.tagStartPos);
                return d(
                  "InvalidTag",
                  "Expected closing tag '" + c.tagName + "' (opened in line " + p.line + ", col " + p.col + ") instead of closing tag '" + o + "'.",
                  g(e, f)
                );
              }
              n.length == 0 && (i = !0);
            }
          } else return d("InvalidTag", "Closing tag '" + o + "' doesn't have proper closing.", g(e, r));
        else {
          const c = Z(u, t);
          if (c !== !0)
            return d(c.err.code, c.err.msg, g(e, r - u.length + c.err.line));
          if (i === !0)
            return d("InvalidXml", "Multiple possible root nodes found.", g(e, r));
          t.unpairedTags.indexOf(o) !== -1 || n.push({ tagName: o, tagStartPos: f }), s = !0;
        }
        for (r++; r < e.length; r++)
          if (e[r] === "<")
            if (e[r + 1] === "!") {
              r++, r = X(e, r);
              continue;
            } else if (e[r + 1] === "?") {
              if (r = Y(e, ++r), r.err) return r;
            } else
              break;
          else if (e[r] === "&") {
            const c = ae(e, r);
            if (c == -1)
              return d("InvalidChar", "char '&' is not expected.", g(e, r));
            r = c;
          } else if (i === !0 && !U(e[r]))
            return d("InvalidXml", "Extra text at the end", g(e, r));
        e[r] === "<" && r--;
      }
    } else {
      if (U(e[r]))
        continue;
      return d("InvalidChar", "char '" + e[r] + "' is not expected.", g(e, r));
    }
  if (s) {
    if (n.length == 1)
      return d("InvalidTag", "Unclosed tag '" + n[0].tagName + "'.", g(e, n[0].tagStartPos));
    if (n.length > 0)
      return d("InvalidXml", "Invalid '" + JSON.stringify(n.map((r) => r.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  } else return d("InvalidXml", "Start tag expected.", 1);
  return !0;
}
function U(e) {
  return e === " " || e === "	" || e === `
` || e === "\r";
}
function Y(e, t) {
  const n = t;
  for (; t < e.length; t++)
    if (e[t] == "?" || e[t] == " ") {
      const s = e.substr(n, t - n);
      if (t > 5 && s === "xml")
        return d("InvalidXml", "XML declaration allowed only at the start of the document.", g(e, t));
      if (e[t] == "?" && e[t + 1] == ">") {
        t++;
        break;
      } else
        continue;
    }
  return t;
}
function X(e, t) {
  if (e.length > t + 5 && e[t + 1] === "-" && e[t + 2] === "-") {
    for (t += 3; t < e.length; t++)
      if (e[t] === "-" && e[t + 1] === "-" && e[t + 2] === ">") {
        t += 2;
        break;
      }
  } else if (e.length > t + 8 && e[t + 1] === "D" && e[t + 2] === "O" && e[t + 3] === "C" && e[t + 4] === "T" && e[t + 5] === "Y" && e[t + 6] === "P" && e[t + 7] === "E") {
    let n = 1;
    for (t += 8; t < e.length; t++)
      if (e[t] === "<")
        n++;
      else if (e[t] === ">" && (n--, n === 0))
        break;
  } else if (e.length > t + 9 && e[t + 1] === "[" && e[t + 2] === "C" && e[t + 3] === "D" && e[t + 4] === "A" && e[t + 5] === "T" && e[t + 6] === "A" && e[t + 7] === "[") {
    for (t += 8; t < e.length; t++)
      if (e[t] === "]" && e[t + 1] === "]" && e[t + 2] === ">") {
        t += 2;
        break;
      }
  }
  return t;
}
const ie = '"', oe = "'";
function le(e, t) {
  let n = "", s = "", i = !1;
  for (; t < e.length; t++) {
    if (e[t] === ie || e[t] === oe)
      s === "" ? s = e[t] : s !== e[t] || (s = "");
    else if (e[t] === ">" && s === "") {
      i = !0;
      break;
    }
    n += e[t];
  }
  return s !== "" ? !1 : {
    value: n,
    index: t,
    tagClosed: i
  };
}
const fe = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function Z(e, t) {
  const n = q(e, fe), s = {};
  for (let i = 0; i < n.length; i++) {
    if (n[i][1].length === 0)
      return d("InvalidAttr", "Attribute '" + n[i][2] + "' has no space in starting.", A(n[i]));
    if (n[i][3] !== void 0 && n[i][4] === void 0)
      return d("InvalidAttr", "Attribute '" + n[i][2] + "' is without value.", A(n[i]));
    if (n[i][3] === void 0 && !t.allowBooleanAttributes)
      return d("InvalidAttr", "boolean attribute '" + n[i][2] + "' is not allowed.", A(n[i]));
    const r = n[i][2];
    if (!ce(r))
      return d("InvalidAttr", "Attribute '" + r + "' is an invalid name.", A(n[i]));
    if (!s.hasOwnProperty(r))
      s[r] = 1;
    else
      return d("InvalidAttr", "Attribute '" + r + "' is repeated.", A(n[i]));
  }
  return !0;
}
function ue(e, t) {
  let n = /\d/;
  for (e[t] === "x" && (t++, n = /[\da-fA-F]/); t < e.length; t++) {
    if (e[t] === ";")
      return t;
    if (!e[t].match(n))
      break;
  }
  return -1;
}
function ae(e, t) {
  if (t++, e[t] === ";")
    return -1;
  if (e[t] === "#")
    return t++, ue(e, t);
  let n = 0;
  for (; t < e.length; t++, n++)
    if (!(e[t].match(/\w/) && n < 20)) {
      if (e[t] === ";")
        break;
      return -1;
    }
  return t;
}
function d(e, t, n) {
  return {
    err: {
      code: e,
      msg: t,
      line: n.line || n,
      col: n.col
    }
  };
}
function ce(e) {
  return R(e);
}
function de(e) {
  return R(e);
}
function g(e, t) {
  const n = e.substring(0, t).split(/\r?\n/);
  return {
    line: n.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: n[n.length - 1].length + 1
  };
}
function A(e) {
  return e.startIndex + e[1].length;
}
const ge = {
  preserveOrder: !1,
  attributeNamePrefix: "@_",
  attributesGroupName: !1,
  textNodeName: "#text",
  ignoreAttributes: !0,
  removeNSPrefix: !1,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: !1,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: !0,
  parseAttributeValue: !1,
  trimValues: !0,
  //Trim string values of tag and attributes
  cdataPropName: !1,
  numberParseOptions: {
    hex: !0,
    leadingZeros: !0,
    eNotation: !0
  },
  tagValueProcessor: function(e, t) {
    return t;
  },
  attributeValueProcessor: function(e, t) {
    return t;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: !1,
  isArray: () => !1,
  commentPropName: !1,
  unpairedTags: [],
  processEntities: !0,
  htmlEntities: !1,
  ignoreDeclaration: !1,
  ignorePiTags: !1,
  transformTagName: !1,
  transformAttributeName: !1,
  updateTag: function(e, t, n) {
    return e;
  },
  // skipEmptyListItem: false
  captureMetaData: !1
}, he = function(e) {
  return Object.assign({}, ge, e);
};
let C;
typeof Symbol != "function" ? C = "@@xmlMetadata" : C = Symbol("XML Node Metadata");
class T {
  constructor(t) {
    this.tagname = t, this.child = [], this[":@"] = {};
  }
  add(t, n) {
    t === "__proto__" && (t = "#__proto__"), this.child.push({ [t]: n });
  }
  addChild(t, n) {
    t.tagname === "__proto__" && (t.tagname = "#__proto__"), t[":@"] && Object.keys(t[":@"]).length > 0 ? this.child.push({ [t.tagname]: t.child, ":@": t[":@"] }) : this.child.push({ [t.tagname]: t.child }), n !== void 0 && (this.child[this.child.length - 1][C] = { startIndex: n });
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return C;
  }
}
function pe(e, t) {
  const n = {};
  if (e[t + 3] === "O" && e[t + 4] === "C" && e[t + 5] === "T" && e[t + 6] === "Y" && e[t + 7] === "P" && e[t + 8] === "E") {
    t = t + 9;
    let s = 1, i = !1, r = !1, f = "";
    for (; t < e.length; t++)
      if (e[t] === "<" && !r) {
        if (i && w(e, "!ENTITY", t)) {
          t += 7;
          let l, o;
          [l, o, t] = be(e, t + 1), o.indexOf("&") === -1 && (n[l] = {
            regx: RegExp(`&${l};`, "g"),
            val: o
          });
        } else if (i && w(e, "!ELEMENT", t)) {
          t += 8;
          const { index: l } = Ee(e, t + 1);
          t = l;
        } else if (i && w(e, "!ATTLIST", t))
          t += 8;
        else if (i && w(e, "!NOTATION", t)) {
          t += 9;
          const { index: l } = Ne(e, t + 1);
          t = l;
        } else if (w(e, "!--", t)) r = !0;
        else throw new Error("Invalid DOCTYPE");
        s++, f = "";
      } else if (e[t] === ">") {
        if (r ? e[t - 1] === "-" && e[t - 2] === "-" && (r = !1, s--) : s--, s === 0)
          break;
      } else e[t] === "[" ? i = !0 : f += e[t];
    if (s !== 0)
      throw new Error("Unclosed DOCTYPE");
  } else
    throw new Error("Invalid Tag instead of DOCTYPE");
  return { entities: n, i: t };
}
const E = (e, t) => {
  for (; t < e.length && /\s/.test(e[t]); )
    t++;
  return t;
};
function be(e, t) {
  t = E(e, t);
  let n = "";
  for (; t < e.length && !/\s/.test(e[t]) && e[t] !== '"' && e[t] !== "'"; )
    n += e[t], t++;
  if ($(n), t = E(e, t), e.substring(t, t + 6).toUpperCase() === "SYSTEM")
    throw new Error("External entities are not supported");
  if (e[t] === "%")
    throw new Error("Parameter entities are not supported");
  let s = "";
  return [t, s] = m(e, t, "entity"), t--, [n, s, t];
}
function Ne(e, t) {
  t = E(e, t);
  let n = "";
  for (; t < e.length && !/\s/.test(e[t]); )
    n += e[t], t++;
  $(n), t = E(e, t);
  const s = e.substring(t, t + 6).toUpperCase();
  if (s !== "SYSTEM" && s !== "PUBLIC")
    throw new Error(`Expected SYSTEM or PUBLIC, found "${s}"`);
  t += s.length, t = E(e, t);
  let i = null, r = null;
  if (s === "PUBLIC")
    [t, i] = m(e, t, "publicIdentifier"), t = E(e, t), (e[t] === '"' || e[t] === "'") && ([t, r] = m(e, t, "systemIdentifier"));
  else if (s === "SYSTEM" && ([t, r] = m(e, t, "systemIdentifier"), !r))
    throw new Error("Missing mandatory system identifier for SYSTEM notation");
  return { notationName: n, publicIdentifier: i, systemIdentifier: r, index: --t };
}
function m(e, t, n) {
  let s = "";
  const i = e[t];
  if (i !== '"' && i !== "'")
    throw new Error(`Expected quoted string, found "${i}"`);
  for (t++; t < e.length && e[t] !== i; )
    s += e[t], t++;
  if (e[t] !== i)
    throw new Error(`Unterminated ${n} value`);
  return t++, [t, s];
}
function Ee(e, t) {
  t = E(e, t);
  let n = "";
  for (; t < e.length && !/\s/.test(e[t]); )
    n += e[t], t++;
  if (!$(n))
    throw new Error(`Invalid element name: "${n}"`);
  t = E(e, t);
  let s = "";
  if (e[t] === "E" && w(e, "MPTY", t)) t += 4;
  else if (e[t] === "A" && w(e, "NY", t)) t += 2;
  else if (e[t] === "(") {
    for (t++; t < e.length && e[t] !== ")"; )
      s += e[t], t++;
    if (e[t] !== ")")
      throw new Error("Unterminated content model");
  } else
    throw new Error(`Invalid Element Expression, found "${e[t]}"`);
  return {
    elementName: n,
    contentModel: s.trim(),
    index: t
  };
}
function w(e, t, n) {
  for (let s = 0; s < t.length; s++)
    if (t[s] !== e[n + s + 1]) return !1;
  return !0;
}
function $(e) {
  if (R(e))
    return e;
  throw new Error(`Invalid entity name ${e}`);
}
const Te = /^[-+]?0x[a-fA-F0-9]+$/, we = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/, ye = {
  hex: !0,
  // oct: false,
  leadingZeros: !0,
  decimalPoint: ".",
  eNotation: !0
  //skipLike: /regex/
};
function Ie(e, t = {}) {
  if (t = Object.assign({}, ye, t), !e || typeof e != "string") return e;
  let n = e.trim();
  if (t.skipLike !== void 0 && t.skipLike.test(n)) return e;
  if (e === "0") return 0;
  if (t.hex && Te.test(n))
    return Oe(n, 16);
  if (n.search(/.+[eE].+/) !== -1)
    return Ae(e, n, t);
  {
    const s = we.exec(n);
    if (s) {
      const i = s[1] || "", r = s[2];
      let f = ve(s[3]);
      const l = i ? (
        // 0., -00., 000.
        e[r.length + 1] === "."
      ) : e[r.length] === ".";
      if (!t.leadingZeros && (r.length > 1 || r.length === 1 && !l))
        return e;
      {
        const o = Number(n), a = String(o);
        if (o === 0) return o;
        if (a.search(/[eE]/) !== -1)
          return t.eNotation ? o : e;
        if (n.indexOf(".") !== -1)
          return a === "0" || a === f || a === `${i}${f}` ? o : e;
        let u = r ? f : n;
        return r ? u === a || i + u === a ? o : e : u === a || u === i + a ? o : e;
      }
    } else
      return e;
  }
}
const Pe = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function Ae(e, t, n) {
  if (!n.eNotation) return e;
  const s = t.match(Pe);
  if (s) {
    let i = s[1] || "";
    const r = s[3].indexOf("e") === -1 ? "E" : "e", f = s[2], l = i ? (
      // 0E.
      e[f.length + 1] === r
    ) : e[f.length] === r;
    return f.length > 1 && l ? e : f.length === 1 && (s[3].startsWith(`.${r}`) || s[3][0] === r) ? Number(t) : n.leadingZeros && !l ? (t = (s[1] || "") + s[3], Number(t)) : e;
  } else
    return e;
}
function ve(e) {
  return e && e.indexOf(".") !== -1 && (e = e.replace(/0+$/, ""), e === "." ? e = "0" : e[0] === "." ? e = "0" + e : e[e.length - 1] === "." && (e = e.substring(0, e.length - 1))), e;
}
function Oe(e, t) {
  if (parseInt) return parseInt(e, t);
  if (Number.parseInt) return Number.parseInt(e, t);
  if (window && window.parseInt) return window.parseInt(e, t);
  throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function me(e) {
  return typeof e == "function" ? e : Array.isArray(e) ? (t) => {
    for (const n of e)
      if (typeof n == "string" && t === n || n instanceof RegExp && n.test(t))
        return !0;
  } : () => !1;
}
class Ce {
  constructor(t) {
    this.options = t, this.currentNode = null, this.tagsNodeStack = [], this.docTypeEntities = {}, this.lastEntities = {
      apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
      gt: { regex: /&(gt|#62|#x3E);/g, val: ">" },
      lt: { regex: /&(lt|#60|#x3C);/g, val: "<" },
      quot: { regex: /&(quot|#34|#x22);/g, val: '"' }
    }, this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" }, this.htmlEntities = {
      space: { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      cent: { regex: /&(cent|#162);/g, val: "¢" },
      pound: { regex: /&(pound|#163);/g, val: "£" },
      yen: { regex: /&(yen|#165);/g, val: "¥" },
      euro: { regex: /&(euro|#8364);/g, val: "€" },
      copyright: { regex: /&(copy|#169);/g, val: "©" },
      reg: { regex: /&(reg|#174);/g, val: "®" },
      inr: { regex: /&(inr|#8377);/g, val: "₹" },
      num_dec: { regex: /&#([0-9]{1,7});/g, val: (n, s) => String.fromCodePoint(Number.parseInt(s, 10)) },
      num_hex: { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (n, s) => String.fromCodePoint(Number.parseInt(s, 16)) }
    }, this.addExternalEntities = Se, this.parseXml = Ve, this.parseTextData = _e, this.resolveNameSpace = ke, this.buildAttributesMap = Me, this.isItStopNode = Be, this.replaceEntitiesValue = Re, this.readStopNodeData = Ue, this.saveTextToParentTag = $e, this.addChild = je, this.ignoreAttributesFn = me(this.options.ignoreAttributes);
  }
}
function Se(e) {
  const t = Object.keys(e);
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    this.lastEntities[s] = {
      regex: new RegExp("&" + s + ";", "g"),
      val: e[s]
    };
  }
}
function _e(e, t, n, s, i, r, f) {
  if (e !== void 0 && (this.options.trimValues && !s && (e = e.trim()), e.length > 0)) {
    f || (e = this.replaceEntitiesValue(e));
    const l = this.options.tagValueProcessor(t, e, n, i, r);
    return l == null ? e : typeof l != typeof e || l !== e ? l : this.options.trimValues ? V(e, this.options.parseTagValue, this.options.numberParseOptions) : e.trim() === e ? V(e, this.options.parseTagValue, this.options.numberParseOptions) : e;
  }
}
function ke(e) {
  if (this.options.removeNSPrefix) {
    const t = e.split(":"), n = e.charAt(0) === "/" ? "/" : "";
    if (t[0] === "xmlns")
      return "";
    t.length === 2 && (e = n + t[1]);
  }
  return e;
}
const Fe = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function Me(e, t, n) {
  if (this.options.ignoreAttributes !== !0 && typeof e == "string") {
    const s = q(e, Fe), i = s.length, r = {};
    for (let f = 0; f < i; f++) {
      const l = this.resolveNameSpace(s[f][1]);
      if (this.ignoreAttributesFn(l, t))
        continue;
      let o = s[f][4], a = this.options.attributeNamePrefix + l;
      if (l.length)
        if (this.options.transformAttributeName && (a = this.options.transformAttributeName(a)), a === "__proto__" && (a = "#__proto__"), o !== void 0) {
          this.options.trimValues && (o = o.trim()), o = this.replaceEntitiesValue(o);
          const u = this.options.attributeValueProcessor(l, o, t);
          u == null ? r[a] = o : typeof u != typeof o || u !== o ? r[a] = u : r[a] = V(
            o,
            this.options.parseAttributeValue,
            this.options.numberParseOptions
          );
        } else this.options.allowBooleanAttributes && (r[a] = !0);
    }
    if (!Object.keys(r).length)
      return;
    if (this.options.attributesGroupName) {
      const f = {};
      return f[this.options.attributesGroupName] = r, f;
    }
    return r;
  }
}
const Ve = function(e) {
  e = e.replace(/\r\n?/g, `
`);
  const t = new T("!xml");
  let n = t, s = "", i = "";
  for (let r = 0; r < e.length; r++)
    if (e[r] === "<")
      if (e[r + 1] === "/") {
        const l = y(e, ">", r, "Closing Tag is not closed.");
        let o = e.substring(r + 2, l).trim();
        if (this.options.removeNSPrefix) {
          const c = o.indexOf(":");
          c !== -1 && (o = o.substr(c + 1));
        }
        this.options.transformTagName && (o = this.options.transformTagName(o)), n && (s = this.saveTextToParentTag(s, n, i));
        const a = i.substring(i.lastIndexOf(".") + 1);
        if (o && this.options.unpairedTags.indexOf(o) !== -1)
          throw new Error(`Unpaired tag can not be used as closing tag: </${o}>`);
        let u = 0;
        a && this.options.unpairedTags.indexOf(a) !== -1 ? (u = i.lastIndexOf(".", i.lastIndexOf(".") - 1), this.tagsNodeStack.pop()) : u = i.lastIndexOf("."), i = i.substring(0, u), n = this.tagsNodeStack.pop(), s = "", r = l;
      } else if (e[r + 1] === "?") {
        let l = M(e, r, !1, "?>");
        if (!l) throw new Error("Pi Tag is not closed.");
        if (s = this.saveTextToParentTag(s, n, i), !(this.options.ignoreDeclaration && l.tagName === "?xml" || this.options.ignorePiTags)) {
          const o = new T(l.tagName);
          o.add(this.options.textNodeName, ""), l.tagName !== l.tagExp && l.attrExpPresent && (o[":@"] = this.buildAttributesMap(l.tagExp, i, l.tagName)), this.addChild(n, o, i, r);
        }
        r = l.closeIndex + 1;
      } else if (e.substr(r + 1, 3) === "!--") {
        const l = y(e, "-->", r + 4, "Comment is not closed.");
        if (this.options.commentPropName) {
          const o = e.substring(r + 4, l - 2);
          s = this.saveTextToParentTag(s, n, i), n.add(this.options.commentPropName, [{ [this.options.textNodeName]: o }]);
        }
        r = l;
      } else if (e.substr(r + 1, 2) === "!D") {
        const l = pe(e, r);
        this.docTypeEntities = l.entities, r = l.i;
      } else if (e.substr(r + 1, 2) === "![") {
        const l = y(e, "]]>", r, "CDATA is not closed.") - 2, o = e.substring(r + 9, l);
        s = this.saveTextToParentTag(s, n, i);
        let a = this.parseTextData(o, n.tagname, i, !0, !1, !0, !0);
        a == null && (a = ""), this.options.cdataPropName ? n.add(this.options.cdataPropName, [{ [this.options.textNodeName]: o }]) : n.add(this.options.textNodeName, a), r = l + 2;
      } else {
        let l = M(e, r, this.options.removeNSPrefix), o = l.tagName;
        const a = l.rawTagName;
        let u = l.tagExp, c = l.attrExpPresent, p = l.closeIndex;
        this.options.transformTagName && (o = this.options.transformTagName(o)), n && s && n.tagname !== "!xml" && (s = this.saveTextToParentTag(s, n, i, !1));
        const L = n;
        L && this.options.unpairedTags.indexOf(L.tagname) !== -1 && (n = this.tagsNodeStack.pop(), i = i.substring(0, i.lastIndexOf("."))), o !== t.tagname && (i += i ? "." + o : o);
        const S = r;
        if (this.isItStopNode(this.options.stopNodes, i, o)) {
          let h = "";
          if (u.length > 0 && u.lastIndexOf("/") === u.length - 1)
            o[o.length - 1] === "/" ? (o = o.substr(0, o.length - 1), i = i.substr(0, i.length - 1), u = o) : u = u.substr(0, u.length - 1), r = l.closeIndex;
          else if (this.options.unpairedTags.indexOf(o) !== -1)
            r = l.closeIndex;
          else {
            const k = this.readStopNodeData(e, a, p + 1);
            if (!k) throw new Error(`Unexpected end of ${a}`);
            r = k.i, h = k.tagContent;
          }
          const _ = new T(o);
          o !== u && c && (_[":@"] = this.buildAttributesMap(u, i, o)), h && (h = this.parseTextData(h, o, i, !0, c, !0, !0)), i = i.substr(0, i.lastIndexOf(".")), _.add(this.options.textNodeName, h), this.addChild(n, _, i, S);
        } else {
          if (u.length > 0 && u.lastIndexOf("/") === u.length - 1) {
            o[o.length - 1] === "/" ? (o = o.substr(0, o.length - 1), i = i.substr(0, i.length - 1), u = o) : u = u.substr(0, u.length - 1), this.options.transformTagName && (o = this.options.transformTagName(o));
            const h = new T(o);
            o !== u && c && (h[":@"] = this.buildAttributesMap(u, i, o)), this.addChild(n, h, i, S), i = i.substr(0, i.lastIndexOf("."));
          } else {
            const h = new T(o);
            this.tagsNodeStack.push(n), o !== u && c && (h[":@"] = this.buildAttributesMap(u, i, o)), this.addChild(n, h, i, S), n = h;
          }
          s = "", r = p;
        }
      }
    else
      s += e[r];
  return t.child;
};
function je(e, t, n, s) {
  this.options.captureMetaData || (s = void 0);
  const i = this.options.updateTag(t.tagname, n, t[":@"]);
  i === !1 || (typeof i == "string" && (t.tagname = i), e.addChild(t, s));
}
const Re = function(e) {
  if (this.options.processEntities) {
    for (let t in this.docTypeEntities) {
      const n = this.docTypeEntities[t];
      e = e.replace(n.regx, n.val);
    }
    for (let t in this.lastEntities) {
      const n = this.lastEntities[t];
      e = e.replace(n.regex, n.val);
    }
    if (this.options.htmlEntities)
      for (let t in this.htmlEntities) {
        const n = this.htmlEntities[t];
        e = e.replace(n.regex, n.val);
      }
    e = e.replace(this.ampEntity.regex, this.ampEntity.val);
  }
  return e;
};
function $e(e, t, n, s) {
  return e && (s === void 0 && (s = t.child.length === 0), e = this.parseTextData(
    e,
    t.tagname,
    n,
    !1,
    t[":@"] ? Object.keys(t[":@"]).length !== 0 : !1,
    s
  ), e !== void 0 && e !== "" && t.add(this.options.textNodeName, e), e = ""), e;
}
function Be(e, t, n) {
  const s = "*." + n;
  for (const i in e) {
    const r = e[i];
    if (s === r || t === r) return !0;
  }
  return !1;
}
function Le(e, t, n = ">") {
  let s, i = "";
  for (let r = t; r < e.length; r++) {
    let f = e[r];
    if (s)
      f === s && (s = "");
    else if (f === '"' || f === "'")
      s = f;
    else if (f === n[0])
      if (n[1]) {
        if (e[r + 1] === n[1])
          return {
            data: i,
            index: r
          };
      } else
        return {
          data: i,
          index: r
        };
    else f === "	" && (f = " ");
    i += f;
  }
}
function y(e, t, n, s) {
  const i = e.indexOf(t, n);
  if (i === -1)
    throw new Error(s);
  return i + t.length - 1;
}
function M(e, t, n, s = ">") {
  const i = Le(e, t + 1, s);
  if (!i) return;
  let r = i.data;
  const f = i.index, l = r.search(/\s/);
  let o = r, a = !0;
  l !== -1 && (o = r.substring(0, l), r = r.substring(l + 1).trimStart());
  const u = o;
  if (n) {
    const c = o.indexOf(":");
    c !== -1 && (o = o.substr(c + 1), a = o !== i.data.substr(c + 1));
  }
  return {
    tagName: o,
    tagExp: r,
    closeIndex: f,
    attrExpPresent: a,
    rawTagName: u
  };
}
function Ue(e, t, n) {
  const s = n;
  let i = 1;
  for (; n < e.length; n++)
    if (e[n] === "<")
      if (e[n + 1] === "/") {
        const r = y(e, ">", n, `${t} is not closed`);
        if (e.substring(n + 2, r).trim() === t && (i--, i === 0))
          return {
            tagContent: e.substring(s, n),
            i: r
          };
        n = r;
      } else if (e[n + 1] === "?")
        n = y(e, "?>", n + 1, "StopNode is not closed.");
      else if (e.substr(n + 1, 3) === "!--")
        n = y(e, "-->", n + 3, "StopNode is not closed.");
      else if (e.substr(n + 1, 2) === "![")
        n = y(e, "]]>", n, "StopNode is not closed.") - 2;
      else {
        const r = M(e, n, ">");
        r && ((r && r.tagName) === t && r.tagExp[r.tagExp.length - 1] !== "/" && i++, n = r.closeIndex);
      }
}
function V(e, t, n) {
  if (t && typeof e == "string") {
    const s = e.trim();
    return s === "true" ? !0 : s === "false" ? !1 : Ie(e, n);
  } else
    return ne(e) ? e : "";
}
const F = T.getMetaDataSymbol();
function Ye(e, t) {
  return G(e, t);
}
function G(e, t, n) {
  let s;
  const i = {};
  for (let r = 0; r < e.length; r++) {
    const f = e[r], l = Xe(f);
    let o = "";
    if (n === void 0 ? o = l : o = n + "." + l, l === t.textNodeName)
      s === void 0 ? s = f[l] : s += "" + f[l];
    else {
      if (l === void 0)
        continue;
      if (f[l]) {
        let a = G(f[l], t, o);
        const u = xe(a, t);
        f[F] !== void 0 && (a[F] = f[F]), f[":@"] ? Ze(a, f[":@"], o, t) : Object.keys(a).length === 1 && a[t.textNodeName] !== void 0 && !t.alwaysCreateTextNode ? a = a[t.textNodeName] : Object.keys(a).length === 0 && (t.alwaysCreateTextNode ? a[t.textNodeName] = "" : a = ""), i[l] !== void 0 && i.hasOwnProperty(l) ? (Array.isArray(i[l]) || (i[l] = [i[l]]), i[l].push(a)) : t.isArray(l, o, u) ? i[l] = [a] : i[l] = a;
      }
    }
  }
  return typeof s == "string" ? s.length > 0 && (i[t.textNodeName] = s) : s !== void 0 && (i[t.textNodeName] = s), i;
}
function Xe(e) {
  const t = Object.keys(e);
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    if (s !== ":@") return s;
  }
}
function Ze(e, t, n, s) {
  if (t) {
    const i = Object.keys(t), r = i.length;
    for (let f = 0; f < r; f++) {
      const l = i[f];
      s.isArray(l, n + "." + l, !0, !0) ? e[l] = [t[l]] : e[l] = t[l];
    }
  }
}
function xe(e, t) {
  const { textNodeName: n } = t, s = Object.keys(e).length;
  return !!(s === 0 || s === 1 && (e[n] || typeof e[n] == "boolean" || e[n] === 0));
}
class We {
  constructor(t) {
    this.externalEntities = {}, this.options = he(t);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Buffer} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(t, n) {
    if (typeof t != "string") if (t.toString)
      t = t.toString();
    else
      throw new Error("XML data is accepted in String or Bytes[] form.");
    if (n) {
      n === !0 && (n = {});
      const r = se(t, n);
      if (r !== !0)
        throw Error(`${r.err.msg}:${r.err.line}:${r.err.col}`);
    }
    const s = new Ce(this.options);
    s.addExternalEntities(this.externalEntities);
    const i = s.parseXml(t);
    return this.options.preserveOrder || i === void 0 ? i : Ye(i, this.options);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(t, n) {
    if (n.indexOf("&") !== -1)
      throw new Error("Entity value can't have '&'");
    if (t.indexOf("&") !== -1 || t.indexOf(";") !== -1)
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    if (n === "&")
      throw new Error("An entity with value '&' is not permitted");
    this.externalEntities[t] = n;
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return T.getMetaDataSymbol();
  }
}
const qe = !P.isPackaged;
let I = null;
function Ge() {
  const e = qe ? N.join(B, "../../backend/dist/xml_genius_backend") : N.join(process.resourcesPath, "backend/xml_genius_backend");
  console.log(`Attempting to run backend at: ${e}`), I = H(e), I.stdout.on("data", (t) => {
    console.log(`Python Backend: ${t.toString()}`);
  }), I.stderr.on("data", (t) => {
    console.error(`Python Backend Error: ${t.toString()}`);
  });
}
const B = N.dirname(z(import.meta.url));
process.env.APP_ROOT = N.join(B, "..");
const j = process.env.VITE_DEV_SERVER_URL, De = N.join(process.env.APP_ROOT, "dist-electron"), J = N.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = j ? N.join(process.env.APP_ROOT, "public") : J;
let b;
function K() {
  b = new x({
    icon: N.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 700,
    height: 660,
    minWidth: 700,
    minHeight: 660,
    webPreferences: {
      preload: N.join(B, "preload.mjs")
    }
  }), b.webContents.on("did-finish-load", () => {
    b == null || b.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), j ? b.loadURL(j) : b.loadFile(N.join(J, "index.html")), v.handle("dialog:openFile", async () => {
    if (!b)
      return null;
    const { canceled: e, filePaths: t } = await Q.showOpenDialog(b, {
      properties: ["openFile", "openDirectory"],
      filters: [
        { name: "Markup Files", extensions: ["xml", "html"] }
      ]
    });
    if (e || !t[0])
      return null;
    const n = t[0], i = O.statSync(n).isDirectory() ? "folder" : "file";
    return { path: n, type: i };
  }), v.handle("xml:parse", async (e, t) => {
    try {
      const n = O.readFileSync(t, "utf-8");
      return { status: "success", data: new We({
        ignoreAttributes: !1,
        // Keep attributes
        attributeNamePrefix: "@_",
        // Prefix attributes to distinguish them
        allowBooleanAttributes: !0,
        // parseAttributeValue: true,
        trimValues: !0
        // parseTagValue: true,
      }).parse(n) };
    } catch (n) {
      return console.error("Failed to parse XML file:", n), { status: "error", message: n instanceof Error ? n.message : String(n) };
    }
  }), v.handle("file:read", async (e, t) => {
    try {
      return O.readFileSync(t, "utf-8");
    } catch (n) {
      return console.error("Failed to read file:", n), null;
    }
  }), v.handle("file:write", async (e, t, n) => {
    try {
      return O.writeFileSync(t, n, "utf-8"), { status: "success" };
    } catch (s) {
      return console.error("Failed to write file:", s), { status: "error", message: s };
    }
  });
}
P.on("window-all-closed", () => {
  process.platform !== "darwin" && (P.quit(), b = null);
});
P.on("activate", () => {
  x.getAllWindows().length === 0 && K();
});
P.whenReady().then(() => {
  Ge(), K();
});
P.on("will-quit", () => {
  I && (console.log("Killing Python backend..."), I.kill(), I = null);
});
export {
  De as MAIN_DIST,
  J as RENDERER_DIST,
  j as VITE_DEV_SERVER_URL
};
