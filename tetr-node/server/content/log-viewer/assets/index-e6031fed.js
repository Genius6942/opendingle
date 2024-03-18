(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) o(n);
  new MutationObserver((n) => {
    for (const a of n)
      if (a.type === "childList")
        for (const h of a.addedNodes)
          h.tagName === "LINK" && h.rel === "modulepreload" && o(h);
  }).observe(document, { childList: !0, subtree: !0 });
  function e(n) {
    const a = {};
    return (
      n.integrity && (a.integrity = n.integrity),
      n.referrerPolicy && (a.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials"
        ? (a.credentials = "include")
        : n.crossOrigin === "anonymous"
          ? (a.credentials = "omit")
          : (a.credentials = "same-origin"),
      a
    );
  }
  function o(n) {
    if (n.ep) return;
    n.ep = !0;
    const a = e(n);
    fetch(n.href, a);
  }
})();
var n1 =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
function s1(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default")
    ? s.default
    : s;
}
var r1 = { exports: {} };
(function (s, t) {
  (function (e, o) {
    s.exports = o();
  })(n1, function () {
    var e = 1e3,
      o = 6e4,
      n = 36e5,
      a = "millisecond",
      h = "second",
      S = "minute",
      D = "hour",
      i = "day",
      A = "week",
      m = "month",
      W = "quarter",
      $ = "year",
      C = "date",
      g = "Invalid Date",
      y =
        /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
      w =
        /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
      k = {
        name: "en",
        weekdays:
          "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months:
          "January_February_March_April_May_June_July_August_September_October_November_December".split(
            "_",
          ),
        ordinal: function (f) {
          var l = ["th", "st", "nd", "rd"],
            r = f % 100;
          return "[" + f + (l[(r - 20) % 10] || l[r] || l[0]) + "]";
        },
      },
      q = function (f, l, r) {
        var u = String(f);
        return !u || u.length >= l
          ? f
          : "" + Array(l + 1 - u.length).join(r) + f;
      },
      z = {
        s: q,
        z: function (f) {
          var l = -f.utcOffset(),
            r = Math.abs(l),
            u = Math.floor(r / 60),
            c = r % 60;
          return (l <= 0 ? "+" : "-") + q(u, 2, "0") + ":" + q(c, 2, "0");
        },
        m: function f(l, r) {
          if (l.date() < r.date()) return -f(r, l);
          var u = 12 * (r.year() - l.year()) + (r.month() - l.month()),
            c = l.clone().add(u, m),
            p = r - c < 0,
            d = l.clone().add(u + (p ? -1 : 1), m);
          return +(-(u + (r - c) / (p ? c - d : d - c)) || 0);
        },
        a: function (f) {
          return f < 0 ? Math.ceil(f) || 0 : Math.floor(f);
        },
        p: function (f) {
          return (
            { M: m, y: $, w: A, d: i, D: C, h: D, m: S, s: h, ms: a, Q: W }[
              f
            ] ||
            String(f || "")
              .toLowerCase()
              .replace(/s$/, "")
          );
        },
        u: function (f) {
          return f === void 0;
        },
      },
      _ = "en",
      P = {};
    P[_] = k;
    var j = function (f) {
        return f instanceof v;
      },
      T = function f(l, r, u) {
        var c;
        if (!l) return _;
        if (typeof l == "string") {
          var p = l.toLowerCase();
          P[p] && (c = p), r && ((P[p] = r), (c = p));
          var d = l.split("-");
          if (!c && d.length > 1) return f(d[0]);
        } else {
          var x = l.name;
          (P[x] = l), (c = x);
        }
        return !u && c && (_ = c), c || (!u && _);
      },
      M = function (f, l) {
        if (j(f)) return f.clone();
        var r = typeof l == "object" ? l : {};
        return (r.date = f), (r.args = arguments), new v(r);
      },
      b = z;
    (b.l = T),
      (b.i = j),
      (b.w = function (f, l) {
        return M(f, { locale: l.$L, utc: l.$u, x: l.$x, $offset: l.$offset });
      });
    var v = (function () {
        function f(r) {
          (this.$L = T(r.locale, null, !0)), this.parse(r);
        }
        var l = f.prototype;
        return (
          (l.parse = function (r) {
            (this.$d = (function (u) {
              var c = u.date,
                p = u.utc;
              if (c === null) return new Date(NaN);
              if (b.u(c)) return new Date();
              if (c instanceof Date) return new Date(c);
              if (typeof c == "string" && !/Z$/i.test(c)) {
                var d = c.match(y);
                if (d) {
                  var x = d[2] - 1 || 0,
                    L = (d[7] || "0").substring(0, 3);
                  return p
                    ? new Date(
                        Date.UTC(
                          d[1],
                          x,
                          d[3] || 1,
                          d[4] || 0,
                          d[5] || 0,
                          d[6] || 0,
                          L,
                        ),
                      )
                    : new Date(
                        d[1],
                        x,
                        d[3] || 1,
                        d[4] || 0,
                        d[5] || 0,
                        d[6] || 0,
                        L,
                      );
                }
              }
              return new Date(c);
            })(r)),
              (this.$x = r.x || {}),
              this.init();
          }),
          (l.init = function () {
            var r = this.$d;
            (this.$y = r.getFullYear()),
              (this.$M = r.getMonth()),
              (this.$D = r.getDate()),
              (this.$W = r.getDay()),
              (this.$H = r.getHours()),
              (this.$m = r.getMinutes()),
              (this.$s = r.getSeconds()),
              (this.$ms = r.getMilliseconds());
          }),
          (l.$utils = function () {
            return b;
          }),
          (l.isValid = function () {
            return this.$d.toString() !== g;
          }),
          (l.isSame = function (r, u) {
            var c = M(r);
            return this.startOf(u) <= c && c <= this.endOf(u);
          }),
          (l.isAfter = function (r, u) {
            return M(r) < this.startOf(u);
          }),
          (l.isBefore = function (r, u) {
            return this.endOf(u) < M(r);
          }),
          (l.$g = function (r, u, c) {
            return b.u(r) ? this[u] : this.set(c, r);
          }),
          (l.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
          }),
          (l.valueOf = function () {
            return this.$d.getTime();
          }),
          (l.startOf = function (r, u) {
            var c = this,
              p = !!b.u(u) || u,
              d = b.p(r),
              x = function (Z, R) {
                var E = b.w(
                  c.$u ? Date.UTC(c.$y, R, Z) : new Date(c.$y, R, Z),
                  c,
                );
                return p ? E : E.endOf(i);
              },
              L = function (Z, R) {
                return b.w(
                  c
                    .toDate()
                    [Z].apply(
                      c.toDate("s"),
                      (p ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(R),
                    ),
                  c,
                );
              },
              F = this.$W,
              I = this.$M,
              H = this.$D,
              J = "set" + (this.$u ? "UTC" : "");
            switch (d) {
              case $:
                return p ? x(1, 0) : x(31, 11);
              case m:
                return p ? x(1, I) : x(0, I + 1);
              case A:
                var N = this.$locale().weekStart || 0,
                  Q = (F < N ? F + 7 : F) - N;
                return x(p ? H - Q : H + (6 - Q), I);
              case i:
              case C:
                return L(J + "Hours", 0);
              case D:
                return L(J + "Minutes", 1);
              case S:
                return L(J + "Seconds", 2);
              case h:
                return L(J + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }),
          (l.endOf = function (r) {
            return this.startOf(r, !1);
          }),
          (l.$set = function (r, u) {
            var c,
              p = b.p(r),
              d = "set" + (this.$u ? "UTC" : ""),
              x = ((c = {}),
              (c[i] = d + "Date"),
              (c[C] = d + "Date"),
              (c[m] = d + "Month"),
              (c[$] = d + "FullYear"),
              (c[D] = d + "Hours"),
              (c[S] = d + "Minutes"),
              (c[h] = d + "Seconds"),
              (c[a] = d + "Milliseconds"),
              c)[p],
              L = p === i ? this.$D + (u - this.$W) : u;
            if (p === m || p === $) {
              var F = this.clone().set(C, 1);
              F.$d[x](L),
                F.init(),
                (this.$d = F.set(C, Math.min(this.$D, F.daysInMonth())).$d);
            } else x && this.$d[x](L);
            return this.init(), this;
          }),
          (l.set = function (r, u) {
            return this.clone().$set(r, u);
          }),
          (l.get = function (r) {
            return this[b.p(r)]();
          }),
          (l.add = function (r, u) {
            var c,
              p = this;
            r = Number(r);
            var d = b.p(u),
              x = function (I) {
                var H = M(p);
                return b.w(H.date(H.date() + Math.round(I * r)), p);
              };
            if (d === m) return this.set(m, this.$M + r);
            if (d === $) return this.set($, this.$y + r);
            if (d === i) return x(1);
            if (d === A) return x(7);
            var L = ((c = {}), (c[S] = o), (c[D] = n), (c[h] = e), c)[d] || 1,
              F = this.$d.getTime() + r * L;
            return b.w(F, this);
          }),
          (l.subtract = function (r, u) {
            return this.add(-1 * r, u);
          }),
          (l.format = function (r) {
            var u = this,
              c = this.$locale();
            if (!this.isValid()) return c.invalidDate || g;
            var p = r || "YYYY-MM-DDTHH:mm:ssZ",
              d = b.z(this),
              x = this.$H,
              L = this.$m,
              F = this.$M,
              I = c.weekdays,
              H = c.months,
              J = c.meridiem,
              N = function (R, E, B, G) {
                return (R && (R[E] || R(u, p))) || B[E].slice(0, G);
              },
              Q = function (R) {
                return b.s(x % 12 || 12, R, "0");
              },
              Z =
                J ||
                function (R, E, B) {
                  var G = R < 12 ? "AM" : "PM";
                  return B ? G.toLowerCase() : G;
                };
            return p.replace(w, function (R, E) {
              return (
                E ||
                (function (B) {
                  switch (B) {
                    case "YY":
                      return String(u.$y).slice(-2);
                    case "YYYY":
                      return b.s(u.$y, 4, "0");
                    case "M":
                      return F + 1;
                    case "MM":
                      return b.s(F + 1, 2, "0");
                    case "MMM":
                      return N(c.monthsShort, F, H, 3);
                    case "MMMM":
                      return N(H, F);
                    case "D":
                      return u.$D;
                    case "DD":
                      return b.s(u.$D, 2, "0");
                    case "d":
                      return String(u.$W);
                    case "dd":
                      return N(c.weekdaysMin, u.$W, I, 2);
                    case "ddd":
                      return N(c.weekdaysShort, u.$W, I, 3);
                    case "dddd":
                      return I[u.$W];
                    case "H":
                      return String(x);
                    case "HH":
                      return b.s(x, 2, "0");
                    case "h":
                      return Q(1);
                    case "hh":
                      return Q(2);
                    case "a":
                      return Z(x, L, !0);
                    case "A":
                      return Z(x, L, !1);
                    case "m":
                      return String(L);
                    case "mm":
                      return b.s(L, 2, "0");
                    case "s":
                      return String(u.$s);
                    case "ss":
                      return b.s(u.$s, 2, "0");
                    case "SSS":
                      return b.s(u.$ms, 3, "0");
                    case "Z":
                      return d;
                  }
                  return null;
                })(R) ||
                d.replace(":", "")
              );
            });
          }),
          (l.utcOffset = function () {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }),
          (l.diff = function (r, u, c) {
            var p,
              d = this,
              x = b.p(u),
              L = M(r),
              F = (L.utcOffset() - this.utcOffset()) * o,
              I = this - L,
              H = function () {
                return b.m(d, L);
              };
            switch (x) {
              case $:
                p = H() / 12;
                break;
              case m:
                p = H();
                break;
              case W:
                p = H() / 3;
                break;
              case A:
                p = (I - F) / 6048e5;
                break;
              case i:
                p = (I - F) / 864e5;
                break;
              case D:
                p = I / n;
                break;
              case S:
                p = I / o;
                break;
              case h:
                p = I / e;
                break;
              default:
                p = I;
            }
            return c ? p : b.a(p);
          }),
          (l.daysInMonth = function () {
            return this.endOf(m).$D;
          }),
          (l.$locale = function () {
            return P[this.$L];
          }),
          (l.locale = function (r, u) {
            if (!r) return this.$L;
            var c = this.clone(),
              p = T(r, u, !0);
            return p && (c.$L = p), c;
          }),
          (l.clone = function () {
            return b.w(this.$d, this);
          }),
          (l.toDate = function () {
            return new Date(this.valueOf());
          }),
          (l.toJSON = function () {
            return this.isValid() ? this.toISOString() : null;
          }),
          (l.toISOString = function () {
            return this.$d.toISOString();
          }),
          (l.toString = function () {
            return this.$d.toUTCString();
          }),
          f
        );
      })(),
      Y = v.prototype;
    return (
      (M.prototype = Y),
      [
        ["$ms", a],
        ["$s", h],
        ["$m", S],
        ["$H", D],
        ["$W", i],
        ["$M", m],
        ["$y", $],
        ["$D", C],
      ].forEach(function (f) {
        Y[f[1]] = function (l) {
          return this.$g(l, f[0], f[1]);
        };
      }),
      (M.extend = function (f, l) {
        return f.$i || (f(l, v, M), (f.$i = !0)), M;
      }),
      (M.locale = T),
      (M.isDayjs = j),
      (M.unix = function (f) {
        return M(1e3 * f);
      }),
      (M.en = P[_]),
      (M.Ls = P),
      (M.p = {}),
      M
    );
  });
})(r1);
var h1 = r1.exports;
const u1 = s1(h1);
var o1 = { exports: {} };
(function (s, t) {
  (function (e, o) {
    s.exports = o();
  })(n1, function () {
    var e = {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A",
      },
      o =
        /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,
      n = /\d\d/,
      a = /\d\d?/,
      h = /\d*[^-_:/,()\s\d]+/,
      S = {},
      D = function (g) {
        return (g = +g) + (g > 68 ? 1900 : 2e3);
      },
      i = function (g) {
        return function (y) {
          this[g] = +y;
        };
      },
      A = [
        /[+-]\d\d:?(\d\d)?|Z/,
        function (g) {
          (this.zone || (this.zone = {})).offset = (function (y) {
            if (!y || y === "Z") return 0;
            var w = y.match(/([+-]|\d\d)/g),
              k = 60 * w[1] + (+w[2] || 0);
            return k === 0 ? 0 : w[0] === "+" ? -k : k;
          })(g);
        },
      ],
      m = function (g) {
        var y = S[g];
        return y && (y.indexOf ? y : y.s.concat(y.f));
      },
      W = function (g, y) {
        var w,
          k = S.meridiem;
        if (k) {
          for (var q = 1; q <= 24; q += 1)
            if (g.indexOf(k(q, 0, y)) > -1) {
              w = q > 12;
              break;
            }
        } else w = g === (y ? "pm" : "PM");
        return w;
      },
      $ = {
        A: [
          h,
          function (g) {
            this.afternoon = W(g, !1);
          },
        ],
        a: [
          h,
          function (g) {
            this.afternoon = W(g, !0);
          },
        ],
        S: [
          /\d/,
          function (g) {
            this.milliseconds = 100 * +g;
          },
        ],
        SS: [
          n,
          function (g) {
            this.milliseconds = 10 * +g;
          },
        ],
        SSS: [
          /\d{3}/,
          function (g) {
            this.milliseconds = +g;
          },
        ],
        s: [a, i("seconds")],
        ss: [a, i("seconds")],
        m: [a, i("minutes")],
        mm: [a, i("minutes")],
        H: [a, i("hours")],
        h: [a, i("hours")],
        HH: [a, i("hours")],
        hh: [a, i("hours")],
        D: [a, i("day")],
        DD: [n, i("day")],
        Do: [
          h,
          function (g) {
            var y = S.ordinal,
              w = g.match(/\d+/);
            if (((this.day = w[0]), y))
              for (var k = 1; k <= 31; k += 1)
                y(k).replace(/\[|\]/g, "") === g && (this.day = k);
          },
        ],
        M: [a, i("month")],
        MM: [n, i("month")],
        MMM: [
          h,
          function (g) {
            var y = m("months"),
              w =
                (
                  m("monthsShort") ||
                  y.map(function (k) {
                    return k.slice(0, 3);
                  })
                ).indexOf(g) + 1;
            if (w < 1) throw new Error();
            this.month = w % 12 || w;
          },
        ],
        MMMM: [
          h,
          function (g) {
            var y = m("months").indexOf(g) + 1;
            if (y < 1) throw new Error();
            this.month = y % 12 || y;
          },
        ],
        Y: [/[+-]?\d+/, i("year")],
        YY: [
          n,
          function (g) {
            this.year = D(g);
          },
        ],
        YYYY: [/\d{4}/, i("year")],
        Z: A,
        ZZ: A,
      };
    function C(g) {
      var y, w;
      (y = g), (w = S && S.formats);
      for (
        var k = (g = y.replace(
            /(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,
            function (M, b, v) {
              var Y = v && v.toUpperCase();
              return (
                b ||
                w[v] ||
                e[v] ||
                w[Y].replace(
                  /(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,
                  function (f, l, r) {
                    return l || r.slice(1);
                  },
                )
              );
            },
          )).match(o),
          q = k.length,
          z = 0;
        z < q;
        z += 1
      ) {
        var _ = k[z],
          P = $[_],
          j = P && P[0],
          T = P && P[1];
        k[z] = T ? { regex: j, parser: T } : _.replace(/^\[|\]$/g, "");
      }
      return function (M) {
        for (var b = {}, v = 0, Y = 0; v < q; v += 1) {
          var f = k[v];
          if (typeof f == "string") Y += f.length;
          else {
            var l = f.regex,
              r = f.parser,
              u = M.slice(Y),
              c = l.exec(u)[0];
            r.call(b, c), (M = M.replace(c, ""));
          }
        }
        return (
          (function (p) {
            var d = p.afternoon;
            if (d !== void 0) {
              var x = p.hours;
              d ? x < 12 && (p.hours += 12) : x === 12 && (p.hours = 0),
                delete p.afternoon;
            }
          })(b),
          b
        );
      };
    }
    return function (g, y, w) {
      (w.p.customParseFormat = !0),
        g && g.parseTwoDigitYear && (D = g.parseTwoDigitYear);
      var k = y.prototype,
        q = k.parse;
      k.parse = function (z) {
        var _ = z.date,
          P = z.utc,
          j = z.args;
        this.$u = P;
        var T = j[1];
        if (typeof T == "string") {
          var M = j[2] === !0,
            b = j[3] === !0,
            v = M || b,
            Y = j[2];
          b && (Y = j[2]),
            (S = this.$locale()),
            !M && Y && (S = w.Ls[Y]),
            (this.$d = (function (u, c, p) {
              try {
                if (["x", "X"].indexOf(c) > -1)
                  return new Date((c === "X" ? 1e3 : 1) * u);
                var d = C(c)(u),
                  x = d.year,
                  L = d.month,
                  F = d.day,
                  I = d.hours,
                  H = d.minutes,
                  J = d.seconds,
                  N = d.milliseconds,
                  Q = d.zone,
                  Z = new Date(),
                  R = F || (x || L ? 1 : Z.getDate()),
                  E = x || Z.getFullYear(),
                  B = 0;
                (x && !L) || (B = L > 0 ? L - 1 : Z.getMonth());
                var G = I || 0,
                  V = H || 0,
                  X = J || 0,
                  t1 = N || 0;
                return Q
                  ? new Date(
                      Date.UTC(E, B, R, G, V, X, t1 + 60 * Q.offset * 1e3),
                    )
                  : p
                    ? new Date(Date.UTC(E, B, R, G, V, X, t1))
                    : new Date(E, B, R, G, V, X, t1);
              } catch {
                return new Date("");
              }
            })(_, T, P)),
            this.init(),
            Y && Y !== !0 && (this.$L = this.locale(Y).$L),
            v && _ != this.format(T) && (this.$d = new Date("")),
            (S = {});
        } else if (T instanceof Array)
          for (var f = T.length, l = 1; l <= f; l += 1) {
            j[1] = T[l - 1];
            var r = w.apply(this, j);
            if (r.isValid()) {
              (this.$d = r.$d), (this.$L = r.$L), this.init();
              break;
            }
            l === f && (this.$d = new Date(""));
          }
        else q.call(this, z);
      };
    };
  });
})(o1);
var f1 = o1.exports;
const d1 = s1(f1),
  g1 = (s) => {
    const t = U(s);
    return () =>
      t.shuffleArray([
        "Z",
        "L",
        "O",
        "S",
        "I",
        "J",
        "T",
        "Z",
        "L",
        "O",
        "S",
        "I",
        "J",
        "T",
      ]);
  },
  p1 = (s) => {
    const t = U(s);
    return () => t.shuffleArray(["Z", "L", "O", "S", "I", "J", "T"]);
  },
  b1 = (s) => {
    const t = ["Z", "L", "O", "S", "I", "J", "T"];
    let e = null;
    const o = U(s);
    return () => {
      let n = Math.floor(o.nextFloat() * (t.length + 1));
      return (
        (n === e || n >= t.length) &&
          (n = Math.floor(o.nextFloat() * t.length)),
        [t[n]]
      );
    };
  },
  m1 = (s) => {
    const t = U(s);
    return () => {
      const e = t.shuffleArray(["Z", "L", "O", "S", "I", "J", "T"]);
      return t.shuffleArray([e[0], e[0], e[0], e[1], e[1], e[1]]);
    };
  },
  w1 = (s) => {
    const t = U(s);
    return () => {
      const e = ["Z", "L", "O", "S", "I", "J", "T"];
      return [e[Math.floor(t.nextFloat() * e.length)]];
    };
  },
  U = (s) => {
    let t = s % 2147483647;
    return (
      t <= 0 && (t += 2147483646),
      {
        next: function () {
          return (t = (16807 * t) % 2147483647);
        },
        nextFloat: function () {
          return (this.next() - 1) / 2147483646;
        },
        shuffleArray: function (e) {
          if (e.length == 0) return e;
          for (let o = e.length - 1; o != 0; o--) {
            const n = Math.floor(this.nextFloat() * (o + 1));
            [e[o], e[n]] = [e[n], e[o]];
          }
          return e;
        },
      }
    );
  },
  k1 = {
    "7-bag": p1,
    "14-bag": g1,
    classic: b1,
    pairs: m1,
    "total-mayhem": w1,
  };
class y1 {
  constructor(t) {
    (this.repopulateListener = null),
      (this.seed = t.seed),
      (this.type = t.type),
      (this.genFunction = k1[this.type](this.seed)),
      (this.value = []),
      (this.minLength = t.minLength);
  }
  onRepopulate(t) {
    this.repopulateListener = t;
  }
  get minLength() {
    return this._minLength;
  }
  set minLength(t) {
    (this._minLength = t), this.repopulate();
  }
  get next() {
    return this.value[0];
  }
  at(t) {
    return this.value.at(t);
  }
  shift() {
    const t = this.value.shift();
    return this.repopulate(), t;
  }
  repopulate() {
    const t = [];
    for (; this.value.length < this.minLength; ) {
      const e = this.genFunction();
      this.value.push(...e), t.push(...e);
    }
    this.repopulateListener && this.repopulateListener(t);
  }
}
class v1 {
  constructor(t) {
    (this._width = t.width),
      (this._height = t.height),
      (this._buffer = t.buffer),
      (this.state = Array(this.fullHeight)
        .fill(null)
        .map(() => Array(this.width).fill(null)));
  }
  get height() {
    return this._height;
  }
  set height(t) {
    this._height = t;
  }
  get width() {
    return this._width;
  }
  set width(t) {
    this._width = t;
  }
  get buffer() {
    return this._buffer;
  }
  set buffer(t) {
    this._buffer = t;
  }
  get fullHeight() {
    return this.height + this.buffer;
  }
  add(...t) {
    t.forEach(([e, o, n]) => {
      this.state[n][o] = e;
    });
  }
  clearLines() {
    const t = [];
    return (
      this.state.forEach((e, o) => {
        e.every((n) => n !== null) && t.push(o);
      }),
      [...t].reverse().forEach((e) => {
        this.state.splice(e, 1),
          this.state.push(new Array(this.width).fill(null));
      }),
      t.length
    );
  }
  get perfectClear() {
    return this.state.every((t) => t.every((e) => e === null));
  }
  insertGarbage({ amount: t, size: e, column: o }) {
    this.state.splice(
      0,
      0,
      ...Array.from({ length: t }, () =>
        Array.from({ length: this.width }, (n, a) =>
          a >= o && a < o + e ? null : "G",
        ),
      ),
    ),
      this.state.splice(this.fullHeight - t - 1, t);
  }
}
const a1 = {
    SRS: {
      kicks: {
        "01": [
          [-1, 0],
          [-1, -1],
          [0, 2],
          [-1, 2],
        ],
        10: [
          [1, 0],
          [1, 1],
          [0, -2],
          [1, -2],
        ],
        12: [
          [1, 0],
          [1, 1],
          [0, -2],
          [1, -2],
        ],
        21: [
          [-1, 0],
          [-1, -1],
          [0, 2],
          [-1, 2],
        ],
        23: [
          [1, 0],
          [1, -1],
          [0, 2],
          [1, 2],
        ],
        32: [
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
        30: [
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
        "03": [
          [1, 0],
          [1, -1],
          [0, 2],
          [1, 2],
        ],
        "02": [
          [0, -1],
          [1, -1],
          [-1, -1],
          [1, 0],
          [-1, 0],
        ],
        13: [
          [1, 0],
          [1, -2],
          [1, -1],
          [0, -2],
          [0, -1],
        ],
        20: [
          [0, 1],
          [-1, 1],
          [1, 1],
          [-1, 0],
          [1, 0],
        ],
        31: [
          [-1, 0],
          [-1, -2],
          [-1, -1],
          [0, -2],
          [0, -1],
        ],
      },
      i_kicks: {
        "01": [
          [-2, 0],
          [1, 0],
          [-2, 1],
          [1, -2],
        ],
        10: [
          [2, 0],
          [-1, 0],
          [2, -1],
          [-1, 2],
        ],
        12: [
          [-1, 0],
          [2, 0],
          [-1, -2],
          [2, 1],
        ],
        21: [
          [1, 0],
          [-2, 0],
          [1, 2],
          [-2, -1],
        ],
        23: [
          [2, 0],
          [-1, 0],
          [2, -1],
          [-1, 2],
        ],
        32: [
          [-2, 0],
          [1, 0],
          [-2, 1],
          [1, -2],
        ],
        30: [
          [1, 0],
          [-2, 0],
          [1, 2],
          [-2, -1],
        ],
        "03": [
          [-1, 0],
          [2, 0],
          [-1, -2],
          [2, 1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      i2_kicks: {
        "01": [
          [0, -1],
          [-1, 0],
          [-1, -1],
        ],
        10: [
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        12: [
          [1, 0],
          [0, -1],
          [1, 0],
        ],
        21: [
          [-1, 0],
          [0, 1],
          [-1, 0],
        ],
        23: [
          [0, 1],
          [1, 0],
          [1, -1],
        ],
        32: [
          [0, -1],
          [-1, 0],
          [-1, 1],
        ],
        30: [
          [-1, 0],
          [0, 1],
          [-1, 2],
        ],
        "03": [
          [1, 0],
          [0, -1],
          [1, -2],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      i3_kicks: {
        "01": [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ],
        10: [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ],
        12: [
          [1, 0],
          [-1, 0],
          [0, -2],
          [0, 2],
        ],
        21: [
          [-1, 0],
          [1, 0],
          [0, 2],
          [0, -2],
        ],
        23: [
          [-1, 0],
          [1, 0],
          [0, 1],
          [0, -1],
        ],
        32: [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1],
        ],
        30: [
          [-1, 0],
          [1, 0],
          [0, 0],
          [0, 0],
        ],
        "03": [
          [1, 0],
          [-1, 0],
          [0, 0],
          [0, 0],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      l3_kicks: {
        "01": [
          [-1, 0],
          [1, 0],
        ],
        10: [
          [1, 0],
          [-1, 0],
        ],
        12: [
          [0, -1],
          [0, 1],
        ],
        21: [
          [0, 1],
          [0, -1],
        ],
        23: [
          [1, 0],
          [-1, 0],
        ],
        32: [
          [-1, 0],
          [1, 0],
        ],
        30: [
          [0, 1],
          [0, -1],
        ],
        "03": [
          [0, -1],
          [0, 1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      i5_kicks: {
        "01": [
          [-2, 0],
          [2, 0],
          [-2, 1],
          [2, -2],
        ],
        10: [
          [2, 0],
          [-2, 0],
          [2, -1],
          [-2, 2],
        ],
        12: [
          [-2, 0],
          [2, 0],
          [-2, -2],
          [2, 1],
        ],
        21: [
          [2, 0],
          [-2, 0],
          [2, 2],
          [-2, -1],
        ],
        23: [
          [2, 0],
          [-2, 0],
          [2, -1],
          [-2, 2],
        ],
        32: [
          [-2, 0],
          [2, 0],
          [-2, 1],
          [2, -2],
        ],
        30: [
          [2, 0],
          [-2, 0],
          [2, 2],
          [-2, -1],
        ],
        "03": [
          [-2, 0],
          [2, 0],
          [-2, -2],
          [2, 1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      oo_kicks: {
        "01": [
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        10: [
          [1, 0],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        12: [
          [-1, 0],
          [0, -1],
          [-1, 1],
          [-1, -1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        21: [
          [0, -1],
          [1, -1],
          [0, 1],
          [1, 1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        23: [
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        32: [
          [1, 0],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        30: [
          [-1, 0],
          [0, -1],
          [-1, 1],
          [-1, -1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        "03": [
          [0, -1],
          [1, -1],
          [0, 1],
          [1, 1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        "02": [[0, -1]],
        13: [[1, 0]],
        20: [[0, 1]],
        31: [[-1, 0]],
      },
      additional_offsets: {},
      spawn_rotation: {},
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "l",
        o: "o",
        s: "s",
        i: "i",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      preview_overrides: {},
    },
    "SRS+": {
      kicks: {
        "01": [
          [-1, 0],
          [-1, -1],
          [0, 2],
          [-1, 2],
        ],
        10: [
          [1, 0],
          [1, 1],
          [0, -2],
          [1, -2],
        ],
        12: [
          [1, 0],
          [1, 1],
          [0, -2],
          [1, -2],
        ],
        21: [
          [-1, 0],
          [-1, -1],
          [0, 2],
          [-1, 2],
        ],
        23: [
          [1, 0],
          [1, -1],
          [0, 2],
          [1, 2],
        ],
        32: [
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
        30: [
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
        "03": [
          [1, 0],
          [1, -1],
          [0, 2],
          [1, 2],
        ],
        "02": [
          [0, -1],
          [1, -1],
          [-1, -1],
          [1, 0],
          [-1, 0],
        ],
        13: [
          [1, 0],
          [1, -2],
          [1, -1],
          [0, -2],
          [0, -1],
        ],
        20: [
          [0, 1],
          [-1, 1],
          [1, 1],
          [-1, 0],
          [1, 0],
        ],
        31: [
          [-1, 0],
          [-1, -2],
          [-1, -1],
          [0, -2],
          [0, -1],
        ],
      },
      i_kicks: {
        "01": [
          [1, 0],
          [-2, 0],
          [-2, 1],
          [1, -2],
        ],
        10: [
          [-1, 0],
          [2, 0],
          [-1, 2],
          [2, -1],
        ],
        12: [
          [-1, 0],
          [2, 0],
          [-1, -2],
          [2, 1],
        ],
        21: [
          [-2, 0],
          [1, 0],
          [-2, -1],
          [1, 2],
        ],
        23: [
          [2, 0],
          [-1, 0],
          [2, -1],
          [-1, 2],
        ],
        32: [
          [1, 0],
          [-2, 0],
          [1, -2],
          [-2, 1],
        ],
        30: [
          [1, 0],
          [-2, 0],
          [1, 2],
          [-2, -1],
        ],
        "03": [
          [-1, 0],
          [2, 0],
          [2, 1],
          [-1, -2],
        ],
        "02": [[0, -1]],
        13: [[1, 0]],
        20: [[0, 1]],
        31: [[-1, 0]],
      },
      i2_kicks: {
        "01": [
          [0, -1],
          [-1, 0],
          [-1, -1],
        ],
        10: [
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        12: [
          [1, 0],
          [0, -1],
          [1, 0],
        ],
        21: [
          [-1, 0],
          [0, 1],
          [-1, 0],
        ],
        23: [
          [0, 1],
          [1, 0],
          [1, -1],
        ],
        32: [
          [0, -1],
          [-1, 0],
          [-1, 1],
        ],
        30: [
          [-1, 0],
          [0, 1],
          [-1, 2],
        ],
        "03": [
          [1, 0],
          [0, -1],
          [1, -2],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      i3_kicks: {
        "01": [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ],
        10: [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ],
        12: [
          [1, 0],
          [-1, 0],
          [0, -2],
          [0, 2],
        ],
        21: [
          [-1, 0],
          [1, 0],
          [0, 2],
          [0, -2],
        ],
        23: [
          [-1, 0],
          [1, 0],
          [0, 1],
          [0, -1],
        ],
        32: [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1],
        ],
        30: [
          [-1, 0],
          [1, 0],
          [0, 0],
          [0, 0],
        ],
        "03": [
          [1, 0],
          [-1, 0],
          [0, 0],
          [0, 0],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      l3_kicks: {
        "01": [
          [-1, 0],
          [1, 0],
        ],
        10: [
          [1, 0],
          [-1, 0],
        ],
        12: [
          [0, -1],
          [0, 1],
        ],
        21: [
          [0, 1],
          [0, -1],
        ],
        23: [
          [1, 0],
          [-1, 0],
        ],
        32: [
          [-1, 0],
          [1, 0],
        ],
        30: [
          [0, 1],
          [0, -1],
        ],
        "03": [
          [0, -1],
          [0, 1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      i5_kicks: {
        "01": [
          [-2, 0],
          [2, 0],
          [-2, 1],
          [2, -2],
        ],
        10: [
          [2, 0],
          [-2, 0],
          [2, -1],
          [-2, 2],
        ],
        12: [
          [-2, 0],
          [2, 0],
          [-2, -2],
          [2, 1],
        ],
        21: [
          [2, 0],
          [-2, 0],
          [2, 2],
          [-2, -1],
        ],
        23: [
          [2, 0],
          [-2, 0],
          [2, -1],
          [-2, 2],
        ],
        32: [
          [-2, 0],
          [2, 0],
          [-2, 1],
          [2, -2],
        ],
        30: [
          [2, 0],
          [-2, 0],
          [2, 2],
          [-2, -1],
        ],
        "03": [
          [-2, 0],
          [2, 0],
          [-2, -2],
          [2, 1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      oo_kicks: {
        "01": [
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        10: [
          [1, 0],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        12: [
          [-1, 0],
          [0, -1],
          [-1, 1],
          [-1, -1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        21: [
          [0, -1],
          [1, -1],
          [0, 1],
          [1, 1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        23: [
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        32: [
          [1, 0],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        30: [
          [-1, 0],
          [0, -1],
          [-1, 1],
          [-1, -1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        "03": [
          [0, -1],
          [1, -1],
          [0, 1],
          [1, 1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        "02": [[0, -1]],
        13: [[1, 0]],
        20: [[0, 1]],
        31: [[-1, 0]],
      },
      additional_offsets: {},
      spawn_rotation: {},
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "l",
        o: "o",
        s: "s",
        i: "i",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      preview_overrides: {},
    },
    "SRS-X": {
      kicks: {
        "01": [
          [-1, 0],
          [-1, -1],
          [0, 2],
          [-1, 2],
        ],
        10: [
          [1, 0],
          [1, 1],
          [0, -2],
          [1, -2],
        ],
        12: [
          [1, 0],
          [1, 1],
          [0, -2],
          [1, -2],
        ],
        21: [
          [-1, 0],
          [-1, -1],
          [0, 2],
          [-1, 2],
        ],
        23: [
          [1, 0],
          [1, -1],
          [0, 2],
          [1, 2],
        ],
        32: [
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
        30: [
          [-1, 0],
          [-1, 1],
          [0, -2],
          [-1, -2],
        ],
        "03": [
          [1, 0],
          [1, -1],
          [0, 2],
          [1, 2],
        ],
        "02": [
          [1, 0],
          [2, 0],
          [1, 1],
          [2, 1],
          [-1, 0],
          [-2, 0],
          [-1, 1],
          [-2, 1],
          [0, -1],
          [3, 0],
          [-3, 0],
        ],
        13: [
          [0, 1],
          [0, 2],
          [-1, 1],
          [-1, 2],
          [0, -1],
          [0, -2],
          [-1, -1],
          [-1, -2],
          [1, 0],
          [0, 3],
          [0, -3],
        ],
        20: [
          [-1, 0],
          [-2, 0],
          [-1, -1],
          [-2, -1],
          [1, 0],
          [2, 0],
          [1, -1],
          [2, -1],
          [0, 1],
          [-3, 0],
          [3, 0],
        ],
        31: [
          [0, 1],
          [0, 2],
          [1, 1],
          [1, 2],
          [0, -1],
          [0, -2],
          [1, -1],
          [1, -2],
          [-1, 0],
          [0, 3],
          [0, -3],
        ],
      },
      i_kicks: {
        "01": [
          [-2, 0],
          [1, 0],
          [-2, 1],
          [1, -2],
        ],
        10: [
          [2, 0],
          [-1, 0],
          [2, -1],
          [-1, 2],
        ],
        12: [
          [-1, 0],
          [2, 0],
          [-1, -2],
          [2, 1],
        ],
        21: [
          [1, 0],
          [-2, 0],
          [1, 2],
          [-2, -1],
        ],
        23: [
          [2, 0],
          [-1, 0],
          [2, -1],
          [-1, 2],
        ],
        32: [
          [-2, 0],
          [1, 0],
          [-2, 1],
          [1, -2],
        ],
        30: [
          [1, 0],
          [-2, 0],
          [1, 2],
          [-2, -1],
        ],
        "03": [
          [-1, 0],
          [2, 0],
          [-1, -2],
          [2, 1],
        ],
        "02": [
          [-1, 0],
          [-2, 0],
          [1, 0],
          [2, 0],
          [0, 1],
        ],
        13: [
          [0, 1],
          [0, 2],
          [0, -1],
          [0, -2],
          [-1, 0],
        ],
        20: [
          [1, 0],
          [2, 0],
          [-1, 0],
          [-2, 0],
          [0, -1],
        ],
        31: [
          [0, 1],
          [0, 2],
          [0, -1],
          [0, -2],
          [1, 0],
        ],
      },
      i2_kicks: {
        "01": [
          [0, -1],
          [-1, 0],
          [-1, -1],
        ],
        10: [
          [0, 1],
          [1, 0],
          [1, 1],
        ],
        12: [
          [1, 0],
          [0, -1],
          [1, 0],
        ],
        21: [
          [-1, 0],
          [0, 1],
          [-1, 0],
        ],
        23: [
          [0, 1],
          [1, 0],
          [1, -1],
        ],
        32: [
          [0, -1],
          [-1, 0],
          [-1, 1],
        ],
        30: [
          [-1, 0],
          [0, 1],
          [-1, 2],
        ],
        "03": [
          [1, 0],
          [0, -1],
          [1, -2],
        ],
        "02": [
          [-1, 0],
          [-2, 0],
          [1, 0],
          [2, 0],
          [0, 1],
        ],
        13: [
          [0, 1],
          [0, 2],
          [0, -1],
          [0, -2],
          [-1, 0],
        ],
        20: [
          [1, 0],
          [2, 0],
          [-1, 0],
          [-2, 0],
          [0, -1],
        ],
        31: [
          [0, 1],
          [0, 2],
          [0, -1],
          [0, -2],
          [1, 0],
        ],
      },
      i3_kicks: {
        "01": [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ],
        10: [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ],
        12: [
          [1, 0],
          [-1, 0],
          [0, -2],
          [0, 2],
        ],
        21: [
          [-1, 0],
          [1, 0],
          [0, 2],
          [0, -2],
        ],
        23: [
          [-1, 0],
          [1, 0],
          [0, 1],
          [0, -1],
        ],
        32: [
          [1, 0],
          [-1, 0],
          [0, -1],
          [0, 1],
        ],
        30: [
          [-1, 0],
          [1, 0],
          [0, 0],
          [0, 0],
        ],
        "03": [
          [1, 0],
          [-1, 0],
          [0, 0],
          [0, 0],
        ],
        "02": [
          [1, 0],
          [2, 0],
          [1, 1],
          [2, 1],
          [-1, 0],
          [-2, 0],
          [-1, 1],
          [-2, 1],
          [0, -1],
          [3, 0],
          [-3, 0],
        ],
        13: [
          [0, 1],
          [0, 2],
          [-1, 1],
          [-1, 2],
          [0, -1],
          [0, -2],
          [-1, -1],
          [-1, -2],
          [1, 0],
          [0, 3],
          [0, -3],
        ],
        20: [
          [-1, 0],
          [-2, 0],
          [-1, -1],
          [-2, -1],
          [1, 0],
          [2, 0],
          [1, -1],
          [2, -1],
          [0, 1],
          [-3, 0],
          [3, 0],
        ],
        31: [
          [0, 1],
          [0, 2],
          [1, 1],
          [1, 2],
          [0, -1],
          [0, -2],
          [1, -1],
          [1, -2],
          [-1, 0],
          [0, 3],
          [0, -3],
        ],
      },
      l3_kicks: {
        "01": [
          [-1, 0],
          [1, 0],
        ],
        10: [
          [1, 0],
          [-1, 0],
        ],
        12: [
          [0, -1],
          [0, 1],
        ],
        21: [
          [0, 1],
          [0, -1],
        ],
        23: [
          [1, 0],
          [-1, 0],
        ],
        32: [
          [-1, 0],
          [1, 0],
        ],
        30: [
          [0, 1],
          [0, -1],
        ],
        "03": [
          [0, -1],
          [0, 1],
        ],
        "02": [
          [1, 0],
          [2, 0],
          [1, 1],
          [2, 1],
          [-1, 0],
          [-2, 0],
          [-1, 1],
          [-2, 1],
          [0, -1],
          [3, 0],
          [-3, 0],
        ],
        13: [
          [0, 1],
          [0, 2],
          [-1, 1],
          [-1, 2],
          [0, -1],
          [0, -2],
          [-1, -1],
          [-1, -2],
          [1, 0],
          [0, 3],
          [0, -3],
        ],
        20: [
          [-1, 0],
          [-2, 0],
          [-1, -1],
          [-2, -1],
          [1, 0],
          [2, 0],
          [1, -1],
          [2, -1],
          [0, 1],
          [-3, 0],
          [3, 0],
        ],
        31: [
          [0, 1],
          [0, 2],
          [1, 1],
          [1, 2],
          [0, -1],
          [0, -2],
          [1, -1],
          [1, -2],
          [-1, 0],
          [0, 3],
          [0, -3],
        ],
      },
      i5_kicks: {
        "01": [
          [-2, 0],
          [2, 0],
          [-2, 1],
          [2, -2],
        ],
        10: [
          [2, 0],
          [-2, 0],
          [2, -1],
          [-2, 2],
        ],
        12: [
          [-2, 0],
          [2, 0],
          [-2, -2],
          [2, 1],
        ],
        21: [
          [2, 0],
          [-2, 0],
          [2, 2],
          [-2, -1],
        ],
        23: [
          [2, 0],
          [-2, 0],
          [2, -1],
          [-2, 2],
        ],
        32: [
          [-2, 0],
          [2, 0],
          [-2, 1],
          [2, -2],
        ],
        30: [
          [2, 0],
          [-2, 0],
          [2, 2],
          [-2, -1],
        ],
        "03": [
          [-2, 0],
          [2, 0],
          [-2, -2],
          [2, 1],
        ],
        "02": [
          [1, 0],
          [2, 0],
          [1, 1],
          [2, 1],
          [-1, 0],
          [-2, 0],
          [-1, 1],
          [-2, 1],
          [0, -1],
          [3, 0],
          [-3, 0],
        ],
        13: [
          [0, 1],
          [0, 2],
          [-1, 1],
          [-1, 2],
          [0, -1],
          [0, -2],
          [-1, -1],
          [-1, -2],
          [1, 0],
          [0, 3],
          [0, -3],
        ],
        20: [
          [-1, 0],
          [-2, 0],
          [-1, -1],
          [-2, -1],
          [1, 0],
          [2, 0],
          [1, -1],
          [2, -1],
          [0, 1],
          [-3, 0],
          [3, 0],
        ],
        31: [
          [0, 1],
          [0, 2],
          [1, 1],
          [1, 2],
          [0, -1],
          [0, -2],
          [1, -1],
          [1, -2],
          [-1, 0],
          [0, 3],
          [0, -3],
        ],
      },
      oo_kicks: {
        "01": [
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        10: [
          [1, 0],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        12: [
          [-1, 0],
          [0, -1],
          [-1, 1],
          [-1, -1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        21: [
          [0, -1],
          [1, -1],
          [0, 1],
          [1, 1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        23: [
          [0, -1],
          [-1, -1],
          [0, 1],
          [-1, 1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        32: [
          [1, 0],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        30: [
          [-1, 0],
          [0, -1],
          [-1, 1],
          [-1, -1],
          [1, 0],
          [1, -1],
          [1, 1],
        ],
        "03": [
          [0, -1],
          [1, -1],
          [0, 1],
          [1, 1],
          [-1, 0],
          [-1, -1],
          [-1, 1],
        ],
        "02": [[0, -1]],
        13: [[1, 0]],
        20: [[0, 1]],
        31: [[-1, 0]],
      },
      additional_offsets: {},
      spawn_rotation: {},
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "l",
        o: "o",
        s: "s",
        i: "i",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      preview_overrides: {},
    },
    "TETRA-X": {
      kicks: {
        "01": [
          [0, 1],
          [-1, 0],
          [1, 0],
          [-1, 1],
          [1, 1],
          [0, -1],
          [-1, -1],
          [1, -1],
        ],
        10: [
          [0, 1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [-1, 1],
          [0, -1],
          [1, -1],
          [-1, -1],
        ],
        12: [
          [0, 1],
          [-1, 0],
          [1, 0],
          [-1, 1],
          [1, 1],
          [0, -1],
          [-1, -1],
          [1, -1],
        ],
        21: [
          [0, 1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [-1, 1],
          [0, -1],
          [1, -1],
          [-1, -1],
        ],
        23: [
          [0, 1],
          [-1, 0],
          [1, 0],
          [-1, 1],
          [1, 1],
          [0, -1],
          [-1, -1],
          [1, -1],
        ],
        32: [
          [0, 1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [-1, 1],
          [0, -1],
          [1, -1],
          [-1, -1],
        ],
        30: [
          [0, 1],
          [-1, 0],
          [1, 0],
          [-1, 1],
          [1, 1],
          [0, -1],
          [-1, -1],
          [1, -1],
        ],
        "03": [
          [0, 1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [-1, 1],
          [0, -1],
          [1, -1],
          [-1, -1],
        ],
        "02": [
          [0, 1],
          [0, -1],
          [-1, 0],
          [1, 0],
        ],
        13: [
          [0, 1],
          [0, -1],
          [-1, 0],
          [1, 0],
        ],
        20: [
          [0, 1],
          [0, -1],
          [-1, 0],
          [1, 0],
        ],
        31: [
          [0, 1],
          [0, -1],
          [-1, 0],
          [1, 0],
        ],
      },
      i_kicks: {
        "01": [
          [0, -1],
          [0, -2],
          [0, 1],
          [1, -1],
          [-1, -1],
          [1, -2],
          [-1, -2],
        ],
        10: [
          [0, -1],
          [0, -2],
          [0, 1],
          [-1, 0],
          [1, 0],
          [2, 0],
        ],
        12: [
          [0, -1],
          [0, -2],
          [0, 1],
          [-1, 0],
          [1, 0],
          [2, 0],
        ],
        21: [
          [0, 1],
          [0, 2],
          [0, -1],
          [-1, 1],
          [1, 1],
          [-1, 2],
          [1, 2],
        ],
        23: [
          [0, 1],
          [0, 2],
          [0, -1],
          [1, 1],
          [-1, 1],
          [1, 2],
          [-1, 2],
        ],
        32: [
          [0, -1],
          [0, -2],
          [0, 1],
          [1, 0],
          [-1, 0],
          [-2, 0],
        ],
        30: [
          [0, -1],
          [0, -2],
          [0, 1],
          [1, 0],
          [-1, 0],
          [-2, 0],
        ],
        "03": [
          [0, -1],
          [0, -2],
          [0, 1],
          [-1, -1],
          [1, -1],
          [-1, -2],
          [1, -2],
        ],
        "02": [
          [0, -1],
          [0, 1],
        ],
        13: [
          [0, -1],
          [0, 1],
        ],
        20: [
          [0, -1],
          [0, 1],
        ],
        31: [
          [0, -1],
          [0, 1],
        ],
      },
      additional_offsets: {},
      spawn_rotation: {},
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "o",
        o: "s",
        s: "i",
        i: "l",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      preview_overrides: {},
    },
    NRS: {
      kicks: {
        "01": [],
        10: [],
        12: [],
        21: [],
        23: [],
        32: [],
        30: [],
        "03": [],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      additional_offsets: {
        z: [
          [1, 1],
          [1, 0],
          [1, 0],
          [2, 0],
        ],
        l: [
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
        ],
        o: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        s: [
          [1, 1],
          [1, 0],
          [1, 0],
          [2, 0],
        ],
        i: [
          [0, 1],
          [0, 0],
          [0, 0],
          [1, 0],
        ],
        j: [
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
        ],
        t: [
          [1, 0],
          [1, 0],
          [1, 0],
          [1, 0],
        ],
      },
      spawn_rotation: { z: 0, l: 2, o: 0, s: 0, i: 0, j: 2, t: 2 },
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "l",
        o: "o",
        s: "s",
        i: "i",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      preview_overrides: {
        l: [
          [0, 0, 201],
          [1, 0, 68],
          [2, 0, 124],
          [0, 1, 31],
        ],
        j: [
          [0, 0, 199],
          [1, 0, 68],
          [2, 0, 114],
          [2, 1, 31],
        ],
        t: [
          [0, 0, 199],
          [1, 0, 74],
          [2, 0, 124],
          [1, 1, 31],
        ],
      },
    },
    ARS: {
      kicks: {
        "01": [
          [1, 0],
          [-1, 0],
        ],
        10: [
          [1, 0],
          [-1, 0],
        ],
        12: [
          [1, 0],
          [-1, 0],
        ],
        21: [
          [1, 0],
          [-1, 0],
        ],
        23: [
          [1, 0],
          [-1, 0],
        ],
        32: [
          [1, 0],
          [-1, 0],
        ],
        30: [
          [1, 0],
          [-1, 0],
        ],
        "03": [
          [1, 0],
          [-1, 0],
        ],
        "02": [
          [1, 0],
          [-1, 0],
        ],
        13: [
          [1, 0],
          [-1, 0],
        ],
        20: [
          [1, 0],
          [-1, 0],
        ],
        31: [
          [1, 0],
          [-1, 0],
        ],
      },
      additional_offsets: {
        i1: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        z: [
          [0, 1],
          [0, 0],
          [0, 0],
          [1, 0],
        ],
        l: [
          [0, 1],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        o: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        s: [
          [0, 1],
          [-1, 0],
          [0, 0],
          [0, 0],
        ],
        i: [
          [0, 0],
          [0, 0],
          [0, -1],
          [1, 0],
        ],
        j: [
          [0, 1],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        t: [
          [0, 1],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
      },
      spawn_rotation: { z: 0, l: 2, o: 0, s: 0, i: 0, j: 2, t: 2 },
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "s",
        l: "l",
        o: "o",
        s: "t",
        i: "z",
        j: "j",
        t: "i",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      preview_overrides: {
        l: [
          [0, 0, 201],
          [1, 0, 68],
          [2, 0, 124],
          [0, 1, 31],
        ],
        j: [
          [0, 0, 199],
          [1, 0, 68],
          [2, 0, 114],
          [2, 1, 31],
        ],
        t: [
          [0, 0, 199],
          [1, 0, 74],
          [2, 0, 124],
          [1, 1, 31],
        ],
      },
      center_column: [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ],
    },
    ASC: {
      kicks: {
        "01": [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        10: [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        12: [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        21: [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        23: [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        32: [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        30: [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        "03": [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      i_kicks: {
        "01": [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        10: [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        12: [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        21: [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        23: [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        32: [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        30: [
          [-1, 0],
          [0, 1],
          [-1, 1],
          [0, 2],
          [-1, 2],
          [-2, 0],
          [-2, 1],
          [-2, 2],
          [1, 0],
          [1, 1],
          [0, -1],
          [-1, -1],
          [-2, -1],
          [1, 2],
          [2, 0],
          [0, -2],
          [-1, -2],
          [-2, -2],
          [2, 1],
          [2, 2],
          [1, -1],
        ],
        "03": [
          [1, 0],
          [0, 1],
          [1, 1],
          [0, 2],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [1, -1],
          [2, -1],
          [-1, 2],
          [-2, 0],
          [0, -2],
          [1, -2],
          [2, -2],
          [-2, 1],
          [-2, 2],
          [-1, -1],
        ],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      allow_o_kick: !0,
      additional_offsets: {
        i1: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        z: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        l: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        o: [
          [0, 0],
          [0, 1],
          [-1, 1],
          [-1, 0],
        ],
        s: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        i: [
          [0, 0],
          [0, -1],
          [1, -1],
          [1, 0],
        ],
        j: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        t: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
      },
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "l",
        o: "o",
        s: "s",
        i: "i",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      spawn_rotation: {},
      preview_overrides: {},
    },
    none: {
      kicks: {
        "01": [],
        10: [],
        12: [],
        21: [],
        23: [],
        32: [],
        30: [],
        "03": [],
        "02": [],
        13: [],
        20: [],
        31: [],
      },
      additional_offsets: {},
      colorMap: {
        i1: "i",
        i2: "i",
        i3: "i",
        l3: "j",
        i5: "i",
        z: "z",
        l: "l",
        o: "o",
        s: "s",
        i: "i",
        j: "j",
        t: "t",
        oo: "o",
        g: "g",
        d: "d",
        gb: "gb",
        gbd: "gbd",
      },
      spawn_rotation: {},
      preview_overrides: {},
    },
  },
  K = (s, t) => {
    if (t.length === 0) return !1;
    for (const e of s)
      if (e[0] < 0 || e[0] >= t[0].length || e[1] < 0 || t[e[1]][e[0]])
        return !1;
    return !0;
  },
  M1 = (s, t, e, o, n, a, h) => {
    if (
      K(
        o.map((m) => [e[0] + m[0], e[1] - m[1]]),
        h,
      )
    )
      return !0;
    const S = `${n}${a}`,
      D = `${t}_kicks`,
      i = a1[s],
      A = D in i ? i[D][S] : i.kicks[S];
    for (let m = 0; m < A.length; m++) {
      const [W, $] = A[m];
      if (
        K(
          o.map((C) => [e[0] + C[0] + W, e[1] - C[1] - $]),
          h,
        )
      )
        return { kick: [W, -$], id: S, index: m };
    }
    return !1;
  },
  l1 = {
    i1: {
      matrix: {
        w: 1,
        h: 1,
        dx: 0,
        dy: 1,
        data: [[[0, 0, 255]], [[0, 0, 255]], [[0, 0, 255]], [[0, 0, 255]]],
      },
      preview: { w: 1, h: 1, data: [[0, 0, 255]] },
    },
    i2: {
      matrix: {
        w: 2,
        h: 2,
        dx: 0,
        dy: 1,
        data: [
          [
            [0, 0, 199],
            [1, 0, 124],
          ],
          [
            [1, 0, 241],
            [1, 1, 31],
          ],
          [
            [1, 1, 124],
            [0, 1, 199],
          ],
          [
            [0, 1, 31],
            [0, 0, 241],
          ],
        ],
      },
      preview: {
        w: 2,
        h: 1,
        data: [
          [0, 0, 199],
          [1, 0, 124],
        ],
      },
    },
    i3: {
      matrix: {
        w: 3,
        h: 3,
        dx: 1,
        dy: 1,
        data: [
          [
            [0, 1, 199],
            [1, 1, 68],
            [2, 1, 124],
          ],
          [
            [1, 0, 241],
            [1, 1, 17],
            [1, 2, 31],
          ],
          [
            [2, 1, 124],
            [1, 1, 68],
            [0, 1, 199],
          ],
          [
            [1, 2, 31],
            [1, 1, 17],
            [1, 0, 241],
          ],
        ],
      },
      preview: {
        w: 3,
        h: 1,
        data: [
          [0, 0, 199],
          [1, 0, 68],
          [2, 0, 124],
        ],
      },
    },
    l3: {
      matrix: {
        w: 2,
        h: 2,
        dx: 0,
        dy: 1,
        data: [
          [
            [0, 0, 241],
            [0, 1, 39],
            [1, 1, 124],
          ],
          [
            [1, 0, 124],
            [0, 0, 201],
            [0, 1, 31],
          ],
          [
            [1, 1, 31],
            [1, 0, 114],
            [0, 0, 199],
          ],
          [
            [0, 1, 199],
            [1, 1, 156],
            [1, 0, 241],
          ],
        ],
      },
      preview: {
        w: 2,
        h: 2,
        data: [
          [0, 0, 241],
          [0, 1, 39],
          [1, 1, 124],
        ],
      },
    },
    i5: {
      matrix: {
        w: 5,
        h: 5,
        dx: 2,
        dy: 2,
        data: [
          [
            [0, 2, 199],
            [1, 2, 68],
            [2, 2, 68],
            [3, 2, 68],
            [4, 2, 124],
          ],
          [
            [2, 0, 241],
            [2, 1, 17],
            [2, 2, 17],
            [2, 3, 17],
            [2, 4, 31],
          ],
          [
            [4, 2, 124],
            [3, 2, 68],
            [2, 2, 68],
            [1, 2, 68],
            [0, 2, 199],
          ],
          [
            [2, 4, 31],
            [2, 3, 17],
            [2, 2, 17],
            [2, 1, 17],
            [2, 0, 241],
          ],
        ],
      },
      preview: {
        w: 5,
        h: 1,
        data: [
          [0, 0, 199],
          [1, 0, 68],
          [2, 0, 68],
          [3, 0, 68],
          [4, 0, 124],
        ],
      },
    },
    z: {
      matrix: {
        w: 3,
        h: 3,
        dx: 1,
        dy: 1,
        data: [
          [
            [0, 0, 199],
            [1, 0, 114],
            [1, 1, 39],
            [2, 1, 124],
          ],
          [
            [2, 0, 241],
            [2, 1, 156],
            [1, 1, 201],
            [1, 2, 31],
          ],
          [
            [2, 2, 124],
            [1, 2, 39],
            [1, 1, 114],
            [0, 1, 199],
          ],
          [
            [0, 2, 31],
            [0, 1, 201],
            [1, 1, 156],
            [1, 0, 241],
          ],
        ],
      },
      preview: {
        w: 3,
        h: 2,
        data: [
          [0, 0, 199],
          [1, 0, 114],
          [1, 1, 39],
          [2, 1, 124],
        ],
      },
    },
    l: {
      matrix: {
        w: 3,
        h: 3,
        dx: 1,
        dy: 1,
        data: [
          [
            [2, 0, 241],
            [0, 1, 199],
            [1, 1, 68],
            [2, 1, 156],
          ],
          [
            [2, 2, 124],
            [1, 0, 241],
            [1, 1, 17],
            [1, 2, 39],
          ],
          [
            [0, 2, 31],
            [2, 1, 124],
            [1, 1, 68],
            [0, 1, 201],
          ],
          [
            [0, 0, 199],
            [1, 2, 31],
            [1, 1, 17],
            [1, 0, 114],
          ],
        ],
      },
      preview: {
        w: 3,
        h: 2,
        data: [
          [2, 0, 241],
          [0, 1, 199],
          [1, 1, 68],
          [2, 1, 156],
        ],
      },
    },
    o: {
      matrix: {
        w: 2,
        h: 2,
        dx: 0,
        dy: 1,
        data: [
          [
            [0, 0, 193],
            [1, 0, 112],
            [0, 1, 7],
            [1, 1, 28],
          ],
          [
            [1, 0, 112],
            [1, 1, 28],
            [0, 0, 193],
            [0, 1, 7],
          ],
          [
            [1, 1, 28],
            [0, 1, 7],
            [1, 0, 112],
            [0, 0, 193],
          ],
          [
            [0, 1, 7],
            [0, 0, 193],
            [1, 1, 28],
            [1, 0, 112],
          ],
        ],
      },
      preview: {
        w: 2,
        h: 2,
        data: [
          [0, 0, 193],
          [1, 0, 112],
          [0, 1, 7],
          [1, 1, 28],
        ],
      },
    },
    s: {
      matrix: {
        w: 3,
        h: 3,
        dx: 1,
        dy: 1,
        data: [
          [
            [1, 0, 201],
            [2, 0, 124],
            [0, 1, 199],
            [1, 1, 156],
          ],
          [
            [2, 1, 114],
            [2, 2, 31],
            [1, 0, 241],
            [1, 1, 39],
          ],
          [
            [1, 2, 156],
            [0, 2, 199],
            [2, 1, 124],
            [1, 1, 201],
          ],
          [
            [0, 1, 39],
            [0, 0, 241],
            [1, 2, 31],
            [1, 1, 114],
          ],
        ],
      },
      preview: {
        w: 3,
        h: 2,
        data: [
          [1, 0, 201],
          [2, 0, 124],
          [0, 1, 199],
          [1, 1, 156],
        ],
      },
    },
    i: {
      matrix: {
        w: 4,
        h: 4,
        dx: 1,
        dy: 1,
        data: [
          [
            [0, 1, 199],
            [1, 1, 68],
            [2, 1, 68],
            [3, 1, 124],
          ],
          [
            [2, 0, 241],
            [2, 1, 17],
            [2, 2, 17],
            [2, 3, 31],
          ],
          [
            [3, 2, 124],
            [2, 2, 68],
            [1, 2, 68],
            [0, 2, 199],
          ],
          [
            [1, 3, 31],
            [1, 2, 17],
            [1, 1, 17],
            [1, 0, 241],
          ],
        ],
      },
      preview: {
        w: 4,
        h: 1,
        data: [
          [0, 0, 199],
          [1, 0, 68],
          [2, 0, 68],
          [3, 0, 124],
        ],
      },
    },
    j: {
      matrix: {
        w: 3,
        h: 3,
        dx: 1,
        dy: 1,
        data: [
          [
            [0, 0, 241],
            [0, 1, 39],
            [1, 1, 68],
            [2, 1, 124],
          ],
          [
            [2, 0, 124],
            [1, 0, 201],
            [1, 1, 17],
            [1, 2, 31],
          ],
          [
            [2, 2, 31],
            [2, 1, 114],
            [1, 1, 68],
            [0, 1, 199],
          ],
          [
            [0, 2, 199],
            [1, 2, 156],
            [1, 1, 17],
            [1, 0, 241],
          ],
        ],
      },
      preview: {
        w: 3,
        h: 2,
        data: [
          [0, 0, 241],
          [0, 1, 39],
          [1, 1, 68],
          [2, 1, 124],
        ],
      },
    },
    t: {
      matrix: {
        w: 3,
        h: 3,
        dx: 1,
        dy: 1,
        data: [
          [
            [1, 0, 241],
            [0, 1, 199],
            [1, 1, 164],
            [2, 1, 124],
          ],
          [
            [2, 1, 124],
            [1, 0, 241],
            [1, 1, 41],
            [1, 2, 31],
          ],
          [
            [1, 2, 31],
            [2, 1, 124],
            [1, 1, 74],
            [0, 1, 199],
          ],
          [
            [0, 1, 199],
            [1, 2, 31],
            [1, 1, 146],
            [1, 0, 241],
          ],
        ],
      },
      preview: {
        w: 3,
        h: 2,
        data: [
          [1, 0, 241],
          [0, 1, 199],
          [1, 1, 164],
          [2, 1, 124],
        ],
      },
    },
    oo: {
      matrix: {
        w: 4,
        h: 4,
        dx: 1,
        dy: 1,
        data: [
          [
            [0, 1, 193],
            [1, 1, 64],
            [2, 1, 64],
            [3, 1, 112],
            [0, 2, 7],
            [1, 2, 4],
            [2, 2, 4],
            [3, 2, 28],
          ],
          [
            [2, 0, 112],
            [2, 1, 16],
            [2, 2, 16],
            [2, 3, 28],
            [1, 0, 193],
            [1, 1, 1],
            [1, 2, 1],
            [1, 3, 7],
          ],
          [
            [3, 2, 28],
            [2, 2, 68],
            [1, 2, 68],
            [0, 2, 7],
            [3, 1, 112],
            [2, 1, 64],
            [1, 1, 64],
            [0, 1, 193],
          ],
          [
            [1, 3, 7],
            [1, 2, 1],
            [1, 1, 1],
            [1, 0, 193],
            [2, 3, 28],
            [2, 2, 16],
            [2, 1, 16],
            [2, 0, 112],
          ],
        ],
      },
      preview: {
        w: 4,
        h: 2,
        data: [
          [0, 0, 193],
          [1, 0, 64],
          [2, 0, 64],
          [3, 0, 112],
          [0, 1, 7],
          [1, 1, 4],
          [2, 1, 4],
          [3, 1, 28],
        ],
      },
      xweight: 1,
    },
  };
class S1 {
  constructor(t) {
    (this.rotation = t.initialRotation), (this.symbol = t.symbol);
    const e = l1[this.symbol.toLowerCase()];
    (this.states = e.matrix.data),
      (this.location = [
        Math.floor(t.boardWidth / 2 - e.matrix.w / 2),
        t.boardHeight + 2,
      ]),
      (this.stats = { b2b: -1, combo: -1 });
  }
  get blocks() {
    return this.states[Math.min(this.rotation, this.states.length)];
  }
  get rotation() {
    return this._rotation % 4;
  }
  set rotation(t) {
    this._rotation = t % 4;
  }
  rotate(t, e, o) {
    const n = this.states[(this.rotation + o) % 4],
      a = M1(
        e,
        this.symbol,
        this.location,
        n,
        this.rotation,
        (this.rotation + o) % 4,
        t,
      );
    if (typeof a == "object") {
      const h = a.kick;
      this.location = [this.location[0] + h[0], this.location[1] + h[1]];
    }
    return a ? ((this.rotation = this.rotation + o), a) : !1;
  }
  rotateCW(t, e) {
    return this.rotate(t, e, 1);
  }
  rotateCCW(t, e) {
    return this.rotate(t, e, 3);
  }
  rotate180(t, e) {
    return this.rotate(t, e, 2);
  }
  moveRight(t) {
    return K(
      this.blocks.map((e) => [
        e[0] + this.location[0] + 1,
        -e[1] + this.location[1],
      ]),
      t,
    )
      ? (this.location[0]++, !0)
      : !1;
  }
  moveLeft(t) {
    return K(
      this.blocks.map((e) => [
        e[0] + this.location[0] - 1,
        -e[1] + this.location[1],
      ]),
      t,
    )
      ? (this.location[0]--, !0)
      : !1;
  }
  softDrop(t) {
    for (
      ;
      K(
        this.blocks.map((e) => [
          e[0] + this.location[0],
          -e[1] + this.location[1] - 1,
        ]),
        t,
      );

    )
      this.location[1]--;
    return !0;
  }
}
const $1 = (s) => JSON.parse(JSON.stringify(s)),
  c1 = (s, t, e, o) => {
    const n = Math.floor(Math.max(0, t - o) / 60);
    return s + e * n;
  },
  O = {
    single: 0,
    double: 1,
    triple: 2,
    quad: 4,
    penta: 5,
    tspinMini: 0,
    tspin: 0,
    tspinMiniSingle: 0,
    tspinSingle: 2,
    tspinMiniDouble: 1,
    tspinDouble: 4,
    tspinTriple: 6,
    tspinQuad: 10,
    tspinPenta: 12,
    backtobackBonus: 1,
    backtobackBonusLog: 0.8,
    comboMinifier: 1,
    comboMinifierLog: 1.25,
    comboBonus: 0.25,
    allClear: 10,
    comboTable: {
      none: [0],
      "classic guideline": [0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5],
      "modern guideline": [0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4],
    },
  },
  _1 = (s, t) => {
    let e = 0;
    const {
        spin: o,
        lines: n,
        piece: a,
        combo: h,
        b2b: S,
        enemies: D,
        perfectClear: i,
      } = s,
      {
        spinBonuses: A,
        comboTable: m,
        b2bChaining: W,
        garbageMultiplier: $,
        garbageTargetBonus: C,
        garbageAttackCap: g,
        garbageBlocking: y,
      } = t,
      w = o === "none" ? null : o === "full" ? "normal" : o;
    switch (n) {
      case 0:
        e = w === "mini" ? O.tspinMini : w === "normal" ? O.tspin : 0;
        break;
      case 1:
        e =
          w === "mini"
            ? O.tspinMiniSingle
            : w === "normal"
              ? O.tspinSingle
              : O.single;
        break;
      case 2:
        e =
          w === "mini"
            ? O.tspinMiniDouble
            : w === "normal"
              ? O.tspinDouble
              : O.double;
        break;
      case 3:
        e = w ? O.tspinTriple : O.triple;
        break;
      case 4:
        e = w ? O.tspinQuad : O.quad;
        break;
      case 5:
        e = w ? O.tspinPenta : O.penta;
        break;
      default: {
        const _ = n - 5;
        e = w ? O.tspinPenta + 2 * _ : O.penta + _;
        break;
      }
    }
    if (
      (w && A === "handheld" && a.toUpperCase() !== "T" && (e /= 2),
      n > 0 && S > 0)
    )
      if (W) {
        const _ =
          O.backtobackBonus *
          (Math.floor(1 + Math.log1p(S * O.backtobackBonusLog)) +
            (S == 1
              ? 0
              : (1 + (Math.log1p(S * O.backtobackBonusLog) % 1)) / 3));
        e += _;
      } else e += O.backtobackBonus;
    if (h > 0)
      if (m === "multiplier")
        (e *= 1 + O.comboBonus * h),
          h > 1 &&
            (e = Math.max(
              Math.log1p(O.comboMinifier * h * O.comboMinifierLog),
              e,
            ));
      else {
        const _ = O.comboTable[m] || [0];
        e += _[Math.max(0, Math.min(h - 1, _.length - 1))];
      }
    const k = c1($.value, s.frame, $.increase, $.marginTime);
    let q = 0;
    if (n > 0 && C !== "none") {
      let _ = 0;
      switch (D) {
        case 0:
        case 1:
          break;
        case 2:
          _ += 1;
          break;
        case 3:
          _ += 3;
          break;
        case 4:
          _ += 5;
          break;
        case 5:
          _ += 7;
          break;
        default:
          _ += 9;
      }
      C === "normal" ? (e += _) : (q = Math.floor(_ * k));
    }
    let z = Math.floor(e * k);
    return (
      g && (z = Math.floor(Math.min(g, z))),
      { garbage: z + (i ? 10 * k : 0), bonus: q * k }
    );
  },
  x1 = (s, t, e) => {
    const o = {
        left: s.moveLeft.bind(s),
        right: s.moveRight.bind(s),
        cw: s.rotateCW.bind(s),
        ccw: s.rotateCCW.bind(s),
        180: s.rotate180.bind(s),
        soft: s.softDrop.bind(s),
      },
      n = [],
      a = (() => {
        const h = {
          rotation: s.falling.rotation,
          location: [...s.falling.location],
        };
        return () => {
          (s.falling.rotation = h.rotation),
            (s.falling.location = [h.location[0], h.location[1]]);
        };
      })();
    for (const h of [null, "ccw", "cw", "180"]) {
      h && o[h]();
      const S =
          s.falling.blocks.reduce((i, A) => [Math.min(i[0], A[0]), 0])[0] +
          s.falling.location[0],
        D =
          s.board.width -
          1 -
          (s.falling.blocks.reduce((i, A) => [Math.max(i[0], A[0]), 0])[0] +
            s.falling.location[0]);
      for (let i = 0; i < S; i++) {
        if (!h && i === 0) continue;
        const A = h
          ? [
              h,
              ...Array(i)
                .fill("")
                .map(() => "left"),
            ]
          : [
              ...Array(i)
                .fill("")
                .map(() => "left"),
            ];
        n.push(A);
      }
      for (let i = 1; i < D; i++) {
        const A = h
          ? [
              h,
              ...Array(i)
                .fill("")
                .map(() => "right"),
            ]
          : [
              ...Array(i)
                .fill("")
                .map(() => "right"),
            ];
        n.push(A);
      }
      a();
    }
    for (; n.length > 0; ) {
      const h = n.shift();
      for (const D of h.slice(0, h.length - 1)) o[D]();
      const S = {
        rotation: s.falling.rotation,
        location: [...s.falling.location],
      };
      if (
        (o[h.at(-1)](),
        (["ccw", "cw", "180"].includes(h.at(-1)) &&
          s.falling.rotation === S.rotation) ||
          (["left", "right"].includes(h.at(-1)) &&
            s.falling.location[0] === S.location[0] &&
            s.falling.location[1] === S.location[1]))
      ) {
        a();
        continue;
      }
      if (
        s.falling.blocks
          .map((D) => [
            s.falling.location[0] + D[0],
            s.falling.location[1] - D[1],
          ])
          .every(
            (D) => e.filter((i) => i[0] === D[0] && i[1] === D[1]).length > 0,
          )
      )
        return a(), h[h.length - 1] === "soft" && h.splice(h.length - 1, 1), h;
      {
        if (h.length >= t) {
          a();
          continue;
        }
        const D = h.at(-1);
        for (const i of Object.keys(o))
          i === "hard" ||
            (i === "cw" && D === "ccw") ||
            (i === "ccw" && D === "cw") ||
            (i === "right" && D === "left") ||
            (i === "left" && D === "right") ||
            n.push([...h, i]);
        a();
      }
    }
    return !1;
  };
class D1 {
  constructor(t) {
    (this.options = t),
      this.options.cap.absolute || (this.options.cap.absolute = 1 / 0),
      (this.queue = []);
  }
  get size() {
    return this.queue.reduce((t, e) => t + e.amount, 0);
  }
  cap(t) {
    return c1(this.options.cap.value, t, this.options.cap.increase, 0);
  }
  recieve(...t) {
    for (this.queue.push(...t); this.size > this.options.cap.absolute; ) {
      const e = this.size;
      this.queue.at(-1).amount <= e - this.options.cap.absolute
        ? this.queue.pop()
        : (this.queue.at(-1).amount -= e - this.options.cap.absolute);
    }
  }
  cancel(t) {
    for (; t > 0 && !(this.queue.length <= 0); )
      if (t >= this.queue[0].amount)
        (t -= this.queue[0].amount), this.queue.shift();
      else {
        (this.queue[0].amount -= t), (t = 0);
        break;
      }
    return t;
  }
  tank(t) {
    let e = this.cap(t);
    const o = [],
      n = this.queue.filter((a) => t - a.frame >= this.options.speed);
    for (
      this.queue = this.queue.sort((a, h) => a.frame - h.frame);
      e > 0 && n.length > 0;

    )
      e >= this.queue.length
        ? (o.push($1(this.queue.shift())), n.shift())
        : ((this.queue[0].amount -= e), (e = 0));
    return o;
  }
}
class e1 {
  constructor(t) {
    (this.queue = new y1(t.queue)),
      (this._kickTable = t.kickTable),
      (this.board = new v1(t.board)),
      (this.garbageQueue = new D1(t.garbage)),
      this.nextPiece(),
      (this.held = null),
      (this.lastSpin = null),
      (this.stats = { combo: -1, b2b: -1 }),
      (this.gameOptions = t.options),
      (this.frame = 0);
  }
  get kickTable() {
    return a1[this._kickTable];
  }
  get kickTableName() {
    return this._kickTable;
  }
  set kickTable(t) {
    this._kickTable = t;
  }
  nextPiece() {
    const t = this.queue.shift();
    this.initiatePiece(t);
  }
  initiatePiece(t) {
    this.falling = new S1({
      boardHeight: this.board.height,
      boardWidth: this.board.width,
      initialRotation:
        t.toLowerCase() in this.kickTable.spawn_rotation
          ? this.kickTable.spawn_rotation[t.toLowerCase()]
          : 0,
      symbol: t,
    });
  }
  isTSpinKick(t) {
    return typeof t == "object"
      ? (t.id === "03" && t.index === 3) || (t.id === "21" && t.index === 3)
      : !1;
  }
  rotateCW() {
    this.lastSpin = {
      piece: this.falling.symbol,
      type: this.detectSpin(
        this.isTSpinKick(
          this.falling.rotateCW(this.board.state, this.kickTableName),
        ),
      ),
    };
  }
  rotateCCW() {
    this.lastSpin = {
      piece: this.falling.symbol,
      type: this.detectSpin(
        this.isTSpinKick(
          this.falling.rotateCCW(this.board.state, this.kickTableName),
        ),
      ),
    };
  }
  rotate180() {
    this.lastSpin = {
      piece: this.falling.symbol,
      type: this.detectSpin(
        this.isTSpinKick(
          this.falling.rotate180(this.board.state, this.kickTableName),
        ),
      ),
    };
  }
  moveRight() {
    this.falling.moveRight(this.board.state);
  }
  moveLeft() {
    this.falling.moveLeft(this.board.state);
  }
  softDrop() {
    this.falling.softDrop(this.board.state);
  }
  detectSpin(t) {
    return this.falling.symbol === "T" ? this.detectTSpin(t) : "none";
  }
  detectTSpin(t) {
    if (this.falling.symbol !== "T") return "none";
    if (t) return "normal";
    const e = this.getTCorners();
    if (e.filter((n) => n).length < 3) return "none";
    const o = [e[this.falling.rotation], e[(this.falling.rotation + 1) % 4]];
    return o[0] && o[1] ? "normal" : "mini";
  }
  getTCorners() {
    const [t, e] = [this.falling.location[0] + 1, this.falling.location[1] - 1],
      o = (n, a) =>
        n < 0 || n >= this.board.width || a < 0
          ? !0
          : this.board.state[a][n] !== null;
    return [o(t - 1, e + 1), o(t + 1, e + 1), o(t + 1, e - 1), o(t - 1, e - 1)];
  }
  hardDrop() {
    this.softDrop(),
      this.board.add(
        ...this.falling.blocks.map((o) => [
          this.falling.symbol,
          this.falling.location[0] + o[0],
          this.falling.location[1] - o[1],
        ]),
      );
    const t = this.board.clearLines();
    t > 0
      ? (this.stats.combo++,
        (this.lastSpin && this.lastSpin.type !== "none") || t > 4
          ? this.stats.b2b++
          : (this.stats.b2b = -1))
      : (this.stats.combo = -1);
    const e = {
      lines: t,
      spin: this.lastSpin ? this.lastSpin.type : "none",
      sent: _1(
        {
          b2b: Math.max(this.stats.b2b, 0),
          combo: Math.max(this.stats.combo, 0),
          enemies: 0,
          lines: t,
          perfectClear: this.board.perfectClear,
          piece: this.falling.symbol,
          spin: this.lastSpin ? this.lastSpin.type : "none",
          frame: this.frame,
        },
        this.gameOptions,
      ).garbage,
      garbageAdded: !1,
    };
    if (t > 0) e.sent -= this.garbageQueue.cancel(e.sent);
    else {
      const o = this.garbageQueue.tank(this.frame);
      (e.garbageAdded = o.length > 0),
        o.forEach((n) => this.board.insertGarbage(n));
    }
    return this.nextPiece(), (this.lastSpin = null), e;
  }
  recieveGarbage(...t) {
    this.garbageQueue.recieve(...t);
  }
  hold() {
    if (this.held) {
      const t = this.held;
      (this.held = this.falling.symbol), this.initiatePiece(t);
    } else (this.held = this.falling.symbol), this.nextPiece();
  }
  getPreview(t) {
    return l1[t.toLowerCase()].preview;
  }
  bfs(t, e) {
    return x1(this, t, e);
  }
  onQueuePieces(t) {
    this.queue.onRepopulate(t);
  }
}
const T1 = (s) => {
    switch (s) {
      case "north":
        return 0;
      case "east":
        return 1;
      case "south":
        return 2;
      case "west":
        return 3;
    }
  },
  i1 = {
    I: [
      [
        [-1, 0],
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [0, 0],
        [0, -1],
        [0, -2],
      ],
      [
        [-2, 0],
        [-1, 0],
        [0, 0],
        [1, 0],
      ],
      [
        [0, 2],
        [0, 1],
        [0, 0],
        [0, -1],
      ],
    ],
    J: [
      [-1, 1],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    L: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    O: [
      [0, 1],
      [0, 0],
      [1, 1],
      [1, 0],
    ],
    S: [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    T: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    Z: [
      [-1, 1],
      [0, 1],
      [0, 0],
      [1, 0],
    ],
  },
  L1 = (s, t) => {
    if (s === "I") return i1[s][t % 4];
    {
      let e = i1[s];
      for (let o = 0; o < t % 4; o++)
        e = e.map((n) => {
          const a = [...n];
          return ([a[0], a[1]] = [a[1], a[0]]), (a[1] = -a[1]), a;
        });
      return e;
    }
  },
  O1 = (s) => {
    const t = T1(s.orientation);
    return L1(s.type, t).map((o) => [o[0] + s.x, o[1] + s.y]);
  },
  C1 = (s, t) => {
    const e = O1(s);
    return t.bfs(7, e);
  };
u1.extend(d1);
const j1 = async (s) => {
    var P;
    let t = new e1(s.gameOptions),
      e = {
        left: t.moveLeft.bind(t),
        right: t.moveRight.bind(t),
        cw: t.rotateCW.bind(t),
        ccw: t.rotateCCW.bind(t),
        180: t.rotate180.bind(t),
        soft: t.softDrop.bind(t),
      };
    const o = document.createElement("canvas"),
      n = o.getContext("2d");
    (P = document.querySelector("#app")) == null || P.appendChild(o);
    const a = 4,
      h = 4,
      S = 0.5,
      D = 15,
      i = (window.innerHeight - 300) / (a + t.board.height),
      A = 5,
      m = 4,
      W = 2,
      $ = 0.5,
      C = 10;
    (o.width = i * (t.board.width + S * 2 + h + m + $ * 2) + C * 2),
      (o.height = (t.board.height + a) * i + C * 2);
    const g = {
        T: "#800080",
        L: "#FFA500",
        J: "#0000FF",
        Z: "#FF0000",
        S: "#00FF00",
        O: "#FFFF00",
        I: "#00FFFF",
        G: "#dddddd",
      },
      y = 20;
    n.translate(C, C);
    const w = () => {
      if (
        (n.clearRect(-C, -C, o.width + C * 2, o.height + C * 2),
        (n.fillStyle = "white"),
        n.fillRect(
          (m + $ * 2) * i,
          a * i,
          t.board.width * i,
          t.board.height * i,
        ),
        t.held)
      ) {
        const v = t.getPreview(t.held);
        (n.fillStyle = g[t.held]),
          v.data.forEach((Y) =>
            n.fillRect(
              ($ + Y[0] + (m / 2 - v.w / 2)) * i,
              (a + $ + Y[1]) * i,
              i,
              i,
            ),
          );
      }
      t.board.state.forEach((v, Y) =>
        v.forEach((f, l) => {
          f &&
            ((n.fillStyle = g[f]),
            n.fillRect(
              (m + $ * 2 + l) * i,
              (a + t.board.height - 1 - Y) * i,
              i,
              i,
            ));
        }),
      ),
        (n.strokeStyle = "black"),
        (n.lineWidth = 2),
        n.beginPath();
      for (let v = 1; v < t.board.width; v++)
        n.moveTo((m + $ * 2 + v) * i, a * i),
          n.lineTo((m + $ * 2 + v) * i, (a + t.board.height) * i);
      for (let v = 1; v < t.board.height; v++)
        n.moveTo((m + $ * 2) * i, (a + v) * i),
          n.lineTo((m + $ * 2 + t.board.width) * i, (a + v) * i);
      n.stroke(),
        n.beginPath(),
        n.roundRect(
          (t.board.width + $ * 2 + m) * i,
          a * i,
          (S * 2 + h) * i,
          D * i,
          [0, y, y, 0],
        ),
        n.roundRect(0, a * i, (m + $ * 2) * i, ($ * 2 + W) * i, [y, 0, 0, y]),
        n.rect((m + $ * 2) * i, 0, t.board.width * i, (t.board.height + a) * i),
        (n.strokeStyle = "black"),
        (n.lineWidth = 3),
        n.stroke(),
        (n.fillStyle = g[t.falling.symbol]),
        t.falling.blocks.forEach((v) =>
          n.fillRect(
            (t.falling.location[0] + v[0] + $ * 2 + m) * i,
            (a + t.board.height - 1 - t.falling.location[1] + v[1]) * i,
            i,
            i,
          ),
        );
      const j = t.queue.value.slice(0, A);
      let T = 1;
      j.forEach((v) => {
        const Y = t.getPreview(v);
        (n.fillStyle = g[v]),
          Y.data.forEach((f) =>
            n.fillRect(
              (t.board.width + S + m + $ * 2 + f[0] + (h / 2 - Y.w / 2)) * i,
              (a + T + f[1]) * i,
              i,
              i,
            ),
          ),
          (T += Y.h + 1);
      });
      const M = t.garbageQueue.size,
        b = 1 / 2;
      (n.fillStyle = "#cc0000"),
        n.fillRect(
          ($ * 2 + m - b) * i,
          (a + t.board.height) * i,
          b * i,
          -M * i,
        ),
        requestAnimationFrame(w);
    };
    requestAnimationFrame(w);
    let k = -1,
      q = 0;
    const z = () => {
      (k = Math.min(s.states.length - 1, Math.max(-1, k))),
        (_.value = k.toString()),
        (q = k < 0 ? 0 : s.states[k].frame),
        (document.getElementById("frame").innerHTML = `Frame: ${q}`),
        (t = new e1(s.gameOptions)),
        (e = {
          left: t.moveLeft.bind(t),
          right: t.moveRight.bind(t),
          cw: t.rotateCW.bind(t),
          ccw: t.rotateCCW.bind(t),
          180: t.rotate180.bind(t),
          soft: t.softDrop.bind(t),
        });
      for (let j = 0; j <= k; j++) {
        const T = s.states[j];
        if (T.type === "garbage") t.recieveGarbage(T);
        else if (T.type === "key") {
          T.location.type.toUpperCase() !== t.falling.symbol && t.hold(),
            (t.frame = T.frame);
          const M = C1(T.location, t);
          M &&
            ((document.getElementById("keys").innerHTML = `Keys: ${M.join(
              ", ",
            )}, hard`),
            M.forEach((b) => e[b]()),
            t.hardDrop());
        }
      }
    };
    window.addEventListener("keydown", (j) => {
      const T = j.key.toLowerCase();
      if (j.repeat) return;
      let M = !0;
      switch (T) {
        case "arrowright":
          k++, z();
          break;
        case "arrowleft":
          k--, z();
          break;
        default:
          M = !1;
          break;
      }
      M && j.preventDefault();
    });
    const _ = document.querySelector("#slider");
    (_.min = "-1"),
      (_.max = (s.states.length - 1).toString()),
      (_.step = "1"),
      _.addEventListener("input", () => {
        (k = parseInt(_.value)), z();
      });
  },
  Y1 =
    location.href.lastIndexOf("/") >= location.href.length - 1
      ? location.href
          .slice(0, location.href.slice(0, location.href.length - 1).length)
          .lastIndexOf("/")
      : location.href.lastIndexOf("/"),
  A1 = location.href.slice(Y1 + 1).replaceAll("/", ""),
  F1 = "/glogs/file?id=" + A1;
fetch(F1)
  .then((s) => s.json())
  .then((s) => j1(s))
  .catch((s) => console.error(s));
