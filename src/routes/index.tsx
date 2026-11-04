import adminPhoto from '@/assets/admin-photo.jpg.asset.json';
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type CSSProperties, type ReactNode, type ReactElement } from "react";
import repairCSS from "../styles/import-repairs.css?raw";
import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/captured.css?raw";

const ImportedFont = "font" as unknown as import("react").ElementType;
const ImportedMarquee = "marquee" as unknown as import("react").ElementType;

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Fresh Teacher's Library 📚" },
    { name: "description", content: "Fresh Teacher's e-library of lesson notes, past papers and schemes of work for Ugandan schools." },
    { property: "og:title", content: "Fresh Teacher's Library 📚" },
    { property: "og:description", content: "Explore nursery, primary and secondary school learning resources from Fresh Teacher." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const [doorOpen, setDoorOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    document.documentElement.dataset['freshReady'] = 'true';
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setChatOpen(false); setExpanded(new Set()); setSidebarMode(false);
      trigger.current?.focus();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  const toggle = (key: string, element: HTMLElement) => {
    trigger.current = element;
    setExpanded(previous => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };
  function repair(node: ReactNode, path = "root", open = false): ReactNode {
    return Children.map(node, (child, index) => {
      if (!isValidElement(child)) return child;
      const element = child as ReactElement<Record<string, any>>;
      const key = `${path}-${index}`;
      const props = element.props;
      const classes = String(props["className"] || "");
      const changes: Record<string, any> = {};
      if (element.type === 'nav' || (classes.split(' ').includes('sidebar') && props['role'] === 'navigation')) return null;
      if (classes.includes("leftcurtain") || classes.includes("rightcurtain") || classes === "rope") {
        changes["className"] = `${classes}${doorOpen ? " door-open" : ""}`;
        changes["role"] = "button";
        changes["aria-label"] = "Open library";
        changes["tabIndex"] = doorOpen ? -1 : 0;
        changes["onClick"] = (event: React.MouseEvent<HTMLElement>) => {
          event.preventDefault(); setDoorOpen(true);
          const audio = document.getElementById("audiocracker");
          if (audio instanceof HTMLAudioElement) void audio.play().catch(() => {});
        };
        changes["onKeyDown"] = (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault(); event.currentTarget.click();
          }
        };
      }
      if (classes.includes("sidebar") && props["role"] === "navigation") {
        changes["className"] = `${classes}${sidebarMode === null ? "" : sidebarMode ? " fresh-sidebar-open" : " fresh-sidebar-closed"}`;
      }
      if (element.type === "ul" && (classes.includes("collapse") || classes.includes("\x63ollapse") || classes.includes("dropdown-menu"))) {
        changes["className"] = `${classes}${open ? " in show fresh-panel-open" : ""}`;
      }
      if (element.type === "a" && props["href"] === "#") {
        changes["role"] = "button"; changes["tabIndex"] = 0; changes["aria-expanded"] = expanded.has(path);
        changes["onClick"] = (event: React.MouseEvent<HTMLElement>) => { event.preventDefault(); toggle(path, event.currentTarget); };
        changes["onKeyDown"] = (event: React.KeyboardEvent<HTMLElement>) => { if (event.key === " ") { event.preventDefault(); toggle(path, event.currentTarget); } };
      }
      if (classes.includes("open-close")) {
        changes["href"] = "#"; changes["role"] = "button"; changes["aria-label"] = "Toggle class menu";
        changes["onClick"] = (event: React.MouseEvent<HTMLElement>) => { event.preventDefault(); trigger.current = event.currentTarget; setSidebarMode(current => current === null ? window.innerWidth < 768 : !current); };
      }
      if (props["id"] === "africavotes-chat") { changes["className"] = chatOpen ? "show" : "hide"; changes["role"] = "dialog"; changes["aria-label"] = "Chat with Fresh Teacher"; }
      if (classes === "africaVotesChat" || classes === "close-chat") {
        changes["href"] = "#"; changes["role"] = "button"; changes["aria-label"] = classes === "close-chat" ? "Close chat" : "Show Chat";
        changes["onClick"] = (event: React.MouseEvent<HTMLElement>) => { event.preventDefault(); trigger.current = event.currentTarget; setChatOpen(current => classes === "close-chat" ? false : !current); };
      }
      if (props["id"] === "chat-input") { changes["value"] = message; changes["onChange"] = (event: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value); changes["aria-label"] = "Message"; }
      if (props["id"] === "send-it") { changes["href"] = message.trim() ? `https://web.whatsapp.com/send?phone=+256750687790&text=${encodeURIComponent(message)}` : "#"; changes["target"] = "_blank"; changes["rel"] = "noopener noreferrer"; changes["role"] = "button"; changes["aria-label"] = "Send message on WhatsApp"; changes["onClick"] = (event: React.MouseEvent) => { if (!message.trim()) event.preventDefault(); }; }
      if (props["id"] === "audiocracker") changes["src"] = "/site-assets/door.mp3";
      if (props["children"] !== undefined) changes["children"] = repair(props["children"], key, element.type === "li" ? expanded.has(key) : open);
      return cloneElement(element, changes);
    });
  }
  return repair(
    <div className="library-homepage">
      <style>{capturedCSS}</style>
      <style>{repairCSS}</style>
      <div className={"leftcurtain"}>
        <img src="/site-assets/7c2eea45ca9862de.png" />
      </div>
      <div className={"rightcurtain"}>
        <img src="/site-assets/d52f1d3e4b7ea8ab.png" />
      </div>
      <a className={"rope"} href="">
        <br />
        <br />
        <div style={{ fontSize: "25px", textShadow: "black 1px 1px 3px, black 1px 1px 3px, black -1px -1px 3px, black -1px -1px 3px", color: "rgb(255, 0, 0)", fontWeight: "bold" } as CSSProperties}>
          <br />
          <b><br /><br />Push this Door<br /></b>
        </div>
        <img src="/site-assets/243d7d09dd033233.gif" height="auto" width="70px" style={{ animation: "0s ease 0s infinite normal none running tada" } as CSSProperties} />
        <br />
        <img src="/site-assets/7b46fdef96d3539f.gif" width="70%" height="70" style={{ animation: "7s ease 0s infinite normal none running tada" } as CSSProperties} />
      </a>
      {ImportedNav()}
      <br />
      <br />
      <br />
      <br />
      <div className={"navbar-default sidebar"} role="navigation" data-site-import-responsive="52">
        <div className={"slimScrollDiv"} style={{ position: "relative", overflow: "hidden", width: "auto", height: "100%" }} data-site-import-responsive="53">
          <div className={"sidebar-nav slimscrollsidebar"} style={{ overflow: "hidden", width: "auto", height: "100%" }} data-site-import-responsive="54">
            <div className={"user-profile"} />
            <ul className={"nav"} id="side-menu">
              <hr className={"style1"} />
              <li>
                <a className={"waves-effect"} download="" href="/Fresh App.apk" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                  <span className={"hide-menu"}>
                    <ImportedFont {...({ color: "green" } as any)}>
                      <ImportedFont {...({ color: "#006bb3" } as any)}>
                        <img src="/site-assets/5c85881a8a34567d.gif" />
                        <b>{"\n                                        "}<ImportedFont {...({ color: "green" } as any)}> Download </ImportedFont>{"\n                                        "}<ImportedFont {...({ color: "#000;" } as any)}> Our</ImportedFont><b style={{ color: "rgb(51, 204, 204)" }}> App </b>{" "}<i aria-hidden="true" className={"fa fa-android fa-lg"} />{"\n                                    "}</b>
                      </ImportedFont>
                    </ImportedFont>
                  </span>
                </a>
                <ImportedFont {...({ color: "green" } as any)}>
                  <ImportedFont {...({ color: "#006bb3" } as any)} />
                </ImportedFont>
              </li>
              <ImportedFont {...({ color: "green" } as any)}>
                <ImportedFont {...({ color: "#006bb3" } as any)}>
                  <hr className={"style1"} />
                  <li>
                    <a className={"waves-effect"} href="#" style={{ paddingTop: "10px", paddingBottom: "10px" }}>{"\n                        "}<i aria-hidden="true" className={"fa fa-calendar-check-o"} />{"\n                        "}<span className={"hide-menu"}><b> Nursery Section</b>{" "}<span className={"fa arrow"} />{" "}</span>{"\n                    "}</a>
                    <ul className={"nav nav-second-level \x63ollapse"}>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Baby
                                              Class</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/BabyAllLessonNotes.html">All Lesson
                                                      Notes</a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/BabyClassLiteracyPastPapers.html","label":"Literacy\n                                                      Past Papers"},{"href":"/BabyClassMathemeticalConceptsPastPapers.html","label":"Mathematical\n                                                      Concepts Past Papers"},{"href":"/BabyClassReadingPastPapers.html","label":"Reading\n                                                      Past Papers"},{"href":"/BabyClassSocialDevelopmentPastPapers.html","label":"Social\n                                                      Development Past Papers"},{"href":"/BabyClassWritingTheologyPastPapers.html","label":"Writing\n                                                      Theology Past Papers"},{"href":"/BabyClassEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/BabyClassGeneralKnowledgePastPapers.html","label":"General\n                                                      Knowledge Past Papers"},{"href":"/BabyClassHealthHabitsPastPapers.html","label":"Health\n                                                      Habits Past Papers"},{"href":"/BabyClassHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/BabyClassLanguageDevelopmentPastPapers.html","label":"Language\n                                                      Development Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/BabyClassAllSchemesofWork.html">All
                                                      Schemes of Work</a>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Middle
                                              Class</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/MiddleClassLessonNotes.html">All
                                                      Lesson Notes</a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/MiddleClassMathemeticalConceptsPastPapers.html","label":"Mathematical\n                                                      Concepts Past Papers"},{"href":"/MiddleClassReadingPastPapers.html","label":"Reading\n                                                      Past Papers"},{"href":"/MiddleClassSocialDevelopmentPastPapers.html","label":"Social\n                                                      Development Past Papers"},{"href":"/MiddleClassWritingTheologyPastPapers.html","label":"Writing\n                                                      Theology Past Papers"},{"href":"/MiddleClassAllPastPapers.html","label":"All\n                                                      Past Papers"},{"href":"/MiddleClassEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/MiddleClassHealthHabitsPastPapers.html","label":"Health\n                                                      Habits Past Papers"},{"href":"/MiddleClassHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/MiddleClassLanguageDevelopmentPastPapers.html","label":"Language\n                                                      Development Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/MiddleClassAllSchemesofWork.html">All
                                                      Schemes of Work</a>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Top
                                              Class</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/TopAllLessonNotes.html">All Lesson
                                                      Notes</a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/TopClassLiteracyPastPapers.html","label":"Literacy\n                                                      Past Papers"},{"href":"/TopClassMathemeticalConceptsPastPapers.html","label":"Mathematical\n                                                      Concepts Past Papers"},{"href":"/TopClassReadingPastPapers.html","label":"Reading\n                                                      Past Papers"},{"href":"/TopClassSocialDevelopmentPastPapers.html","label":"Social\n                                                      Development Past Papers"},{"href":"/TopClassWritingTheologyPastPapers.html","label":"Writing\n                                                      Theology Past Papers"},{"href":"/TopClassEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/TopClassHealthHabitsPastPapers.html","label":"Health\n                                                      Habits Past Papers"},{"href":"/TopClassHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/TopClassLanguageDevelopmentPastPapers.html","label":"Language\n                                                      Development Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/TopClassAllSchemesofWork.html">All
                                                      Schemes of Work</a>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <hr className={"style1"} />
                  <li>
                    <a className={"waves-effect"} href="#" style={{ paddingTop: "10px", paddingBottom: "10px" }}>{"\n                        "}<i aria-hidden="true" className={"fa fa-calendar-check-o"} />{"\n                        "}<span className={"hide-menu"}><b> Primary Section</b>{" "}<span className={"fa arrow"} />{" "}</span>{"\n                    "}</a>
                    <ul className={"nav nav-second-level \x63ollapse"}>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              One</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryOneNewsLessonNotes.html","label":"News\n                                                      Lesson Notes"},{"href":"/PrimaryOneOralLiteratureLessonNotes.html","label":"Oral\n                                                      Literature Lesson Notes"},{"href":"/PrimaryOneReadingLessonNotes.html","label":"Reading\n                                                      Lesson Notes"},{"href":"/PrimaryOneRELessonNotes.html","label":"Religious\n                                                      Education Lesson Notes"},{"href":"/PrimaryOneRunyankoreRukigaLessonNotes.html","label":"Runyankore/Rukiga\n                                                      Lesson Notes"},{"href":"/PrimaryOneThematicLessonNotes.html","label":"Thematic\n                                                      Lesson Notes"},{"href":"/PrimaryOneEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"},{"href":"/PrimaryOneICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/PrimaryOneLit1LessonNotes.html","label":"Literacy\n                                                      1 Lesson Notes"},{"href":"/PrimaryOneLit2LessonNotes.html","label":"Literacy\n                                                      2 Lesson Notes"},{"href":"/PrimaryOneLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/PrimaryOneMTCLessonNotes.html","label":"MTC\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryOneMTCSchemesofWork.html","label":"MTC\n                                                      Schemes of Work"},{"href":"/PrimaryOneMusicSchemesofWork.html","label":"Music\n                                                      Schemes of Work"},{"href":"/PrimaryOneOralLiteratureLessonNotes.html","label":"Oral\n                                                      Literature Schemes of Work"},{"href":"/PrimaryOnePESchemesofWork.html","label":"PE\n                                                      Schemes of Work"},{"href":"/PrimaryOneReadingSchemesofWork.html","label":"Reading\n                                                      Schemes of Work"},{"href":"/PrimaryOneRESchemesofWork.html","label":"RE\n                                                      Schemes of Work"},{"href":"/PrimaryOneThematicSchemesofWork.html","label":"Thematic\n                                                      Schemes of Work"},{"href":"/PrimaryOneAllSchemesofWork.html","label":"All\n                                                      Schemes of Work"},{"href":"/PrimaryOneEnglishSchemesofWork.html","label":"English\n                                                      Schemes of Work"},{"href":"/PrimaryOneLit1SchemesofWork.html","label":"Literature\n                                                      1 Schemes of Work"},{"href":"/PrimaryOneLit2LSchemesofWork.html","label":"Literature\n                                                      2 Schemes of Work"},{"href":"/PrimaryOneLugandaSchemesofWork.html","label":"Luganda\n                                                      Schemes of Work"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryOnePackagesPastPapers.html","label":"Packages\n                                                      Past Papers"},{"href":"/PrimaryOneReadingPastPapers.html","label":"Reading\n                                                      Past Papers"},{"href":"/PrimaryOneREPastPapers.html","label":"Religious\n                                                      Education Past Papers"},{"href":"/PrimaryOneTheologyPastPapers.html","label":"Theology\n                                                      Past Papers"},{"href":"/PrimaryOneEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/PrimaryOneICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/PrimaryOneLit1PastPapers.html","label":"Literacy\n                                                      1 Past Papers"},{"href":"/PrimaryOneLit2PastPapers.html","label":"Literacy\n                                                      2 Past Papers"},{"href":"/PrimaryOneLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/PrimaryOneMTCPastPapers.html","label":"MTC\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              Two</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryTwoICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/PrimaryTwoLit1LessonNotes.html","label":"Literacy\n                                                      1 Lesson Notes"},{"href":"/PrimaryTwoLit2LessonNotes.html","label":"Literacy\n                                                      2 Lesson Notes"},{"href":"/PrimaryTwoLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/PrimaryTwoMTCLessonNotes.html","label":"MTC\n                                                      Lesson Notes"},{"href":"/PrimaryTwoNewsLessonNotes.html","label":"News\n                                                      Lesson Notes"},{"href":"/PrimaryTwoPELessonNotes.html","label":"PE\n                                                      Lesson Notes"},{"href":"/PrimaryTwoReadingLessonNotes.html","label":"Reading\n                                                      Lesson Notes"},{"href":"/PrimaryTwoRELessonNotes.html","label":"RE\n                                                      Lesson Notes"},{"href":"/PrimaryTwoRunyankoreRukigaLessonNotes.html","label":"Runyankore/Rukiga\n                                                      Lesson Notes"},{"href":"/PrimaryTwoThematicLessonNotes.html","label":"Thematic\n                                                      Lesson Notes"},{"href":"/PrimaryTwoWritingLessonNotes.html","label":"Writing\n                                                      Lesson Notes"},{"href":"/PrimaryTwoAllLessonNotes.html","label":"All\n                                                      Lesson Notes"},{"href":"/PrimaryTwoEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryTwoLit1SchemesofWork.html","label":"Literacy\n                                                      1 Schemes of Work"},{"href":"/PrimaryTwoLit2SchemesofWork.html","label":"Literacy\n                                                      2 Schemes of Work"},{"href":"/PrimaryTwoLugandaSchemesofWork.html","label":"Luganda\n                                                      Schemes of Work"},{"href":"/PrimaryTwoMTCSchemesofWork.html","label":"MTC\n                                                      Schemes of Work"},{"href":"/PrimaryTwoPESchemesofWork.html","label":"PE\n                                                      Schemes of Work"},{"href":"/PrimaryTwoReadingSchemesofWork.html","label":"Reading\n                                                      Schemes of Work"},{"href":"/PrimaryTwoRESchemesofWork.html","label":"RE\n                                                      Schemes of Work"},{"href":"/PrimaryTwoThematicSchemesofWork.html","label":"Thematic\n                                                      Schemes of Work"},{"href":"/PrimaryTwoAllSchemesofWork.html","label":"All\n                                                      Schemes of Work"},{"href":"/PrimaryTwoEnglishSchemesofWork.html","label":"English\n                                                      Schemes of Work"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryTwoHolidayPackages.html","label":"Holiday\n                                                      Packages Past Papers"},{"href":"/PrimaryTwoICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/PrimaryTwoLit1PastPapers.html","label":"Literacy\n                                                      1 Past Papers"},{"href":"/PrimaryTwoLit2PastPapers.html","label":"Literacy\n                                                      2 Past Papers"},{"href":"/PrimaryTwoLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/PrimaryTwoMTCPastPapers.html","label":"MTC\n                                                      Past Papers"},{"href":"/PrimaryTwoReadingPastPapers.html","label":"Reading\n                                                      Past Papers"},{"href":"/PrimaryTwoREPastPapers.html","label":"RE\n                                                      Past Papers"},{"href":"/PrimaryTwoTheologyPastPapers.html","label":"Theology\n                                                      Past Papers"},{"href":"/PrimaryTwoWritingPastPapers.html","label":"Writing\n                                                      Past Papers"},{"href":"/PrimaryTwoEnglishPastPapers.html","label":"English\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              Three</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryThreeLit1LessonNotes.html","label":"Literacy\n                                                      1 Lesson Notes"},{"href":"/PrimaryThreeLit2LessonNotes.html","label":"Literacy\n                                                      2 Lesson Notes"},{"href":"/PrimaryThreeLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/PrimaryThreeMTCLessonNotes.html","label":"MTC\n                                                      Lesson Notes"},{"href":"/PrimaryThreeReadingLessonNotes.html","label":"Reading\n                                                      Lesson Notes"},{"href":"/PrimaryThreeRELessonNotes.html","label":"RE\n                                                      Lesson Notes"},{"href":"/PrimaryThreeRunyankoreRukigaLessonNotes.html","label":"Runyankore/Rukiga\n                                                      Lesson Notes"},{"href":"/PrimaryThreeWritingLessonNotes.html","label":"Writing\n                                                      Lesson Notes"},{"href":"/PrimaryThreeArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/PrimaryThreeEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryThreeICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/PrimaryThreeKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/PrimaryThreeLit1PastPapers.html","label":"Literacy\n                                                      1 Past Papers"},{"href":"/PrimaryThreeLit2PastPapers.html","label":"Literacy\n                                                      2 Past Papers"},{"href":"/PrimaryThreeLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/PrimaryThreeMTCPastPapers.html","label":"MTC\n                                                      Past Papers"},{"href":"/PrimaryThreePackagesPastPapers.html","label":"Packages\n                                                      Past Papers"},{"href":"/PrimaryThreeReadingPastPapers.html","label":"Reading\n                                                      Past Papers"},{"href":"/PrimaryThreeREPastPapers.html","label":"RE\n                                                      Past Papers"},{"href":"/PrimaryThreeWritingPastPapers.html","label":"Writing\n                                                      Past Papers"},{"href":"/PrimaryThreeEnglishPastPapers.html","label":"English\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryThreeICTSchemesofWork.html","label":"ICT\n                                                      Schemes of Work"},{"href":"/PrimaryThreeLugandaSchemesofWork.html","label":"Luganda\n                                                      Schemes of Work"},{"href":"/PrimaryThreeMTCSchemesofWork.html","label":"MTC\n                                                      Schemes of Work"},{"href":"/PrimaryThreePESchemesofWork.html","label":"PE\n                                                      Schemes of Work"},{"href":"/PrimaryThreeReadingSchemesofWork.html","label":"Reading\n                                                      Schemes of Work"},{"href":"/PrimaryThreeRESchemesofWork.html","label":"RE\n                                                      Schemes of Work"},{"href":"/PrimaryThreeScienceSchemesofWork.html","label":"Science\n                                                      Schemes of Work"},{"href":"/PrimaryThreeSSTSchemesofWork.html","label":"Social\n                                                      Studies Schemes of Work"},{"href":"/PrimaryThreeThematicSchemesofWork.html","label":"Thematic\n                                                      Schemes of Work"},{"href":"/PrimaryThreeAgricSchemesofWork.html","label":"Agriculture\n                                                      Schemes of Work"},{"href":"/PrimaryThreeAllSchemesofWork.html","label":"All\n                                                      Schemes of Work"},{"href":"/PrimaryThreeArtSchemesofWork.html","label":"Art\n                                                      Schemes of Work"},{"href":"/PrimaryThreeEnglishSchemesofWork.html","label":"English\n                                                      Schemes of Work"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              Four</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/PrimaryFourAllLessonNotes.html">All
                                                      Lesson Notes</a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryFourPackagesPastPapers.html","label":"Packages\n                                                      Past Papers"},{"href":"/PrimaryFourREPastPapers.html","label":"RE\n                                                      Past Papers"},{"href":"/PrimaryFourSciencePastPapers.html","label":"Science\n                                                      Past Papers"},{"href":"/PrimaryFourSSTPastPapers.html","label":"SST\n                                                      Past Papers"},{"href":"/PrimaryFourTheologyPastPapers.html","label":"Theology\n                                                      Past Papers"},{"href":"/PrimaryFourEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/PrimaryFourICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/PrimaryFourIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/PrimaryFourKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/PrimaryFourMTCPastPapers.html","label":"MTC\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              <li>
                                <a href="/PrimaryFourAllSchemesofWork.html">All
                                                      Schemes of Work</a>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              Five</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryFiveMTCLessonNotes.html","label":"MTC\n                                                      Lesson Notes"},{"href":"/PrimaryFiveRELessonNotes.html","label":"RE\n                                                      Lesson Notes"},{"href":"/PrimaryFiveScienceLessonNotes.html","label":"Science\n                                                      Lesson Notes"},{"href":"/PrimaryFiveSSTLessonNotes.html","label":"SST\n                                                      Lesson Notes"},{"href":"/PrimaryFiveEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryFivePackagesPastPapers.html","label":"Packages\n                                                      Past Papers"},{"href":"/PrimaryFiveREPastPapers.html","label":"RE\n                                                      Past Papers"},{"href":"/PrimaryFiveSciencePastPapers.html","label":"Science\n                                                      Past Papers"},{"href":"/PrimaryFiveSSTPastPapers.html","label":"SST\n                                                      Past Papers"},{"href":"/PrimaryFiveTheologyPastPapers.html","label":"Theology\n                                                      Past Papers"},{"href":"/PrimaryFiveEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/PrimaryFiveICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/PrimaryFiveMTCPastPapers.html","label":"MTC\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimaryFiveMTCSchemesofWork.html","label":"MTC\n                                                      Schemes of Work"},{"href":"/PrimaryFivePESchemesofWork.html","label":"PE\n                                                      Schemes of Work"},{"href":"/PrimaryFiveRESchemesofWork.html","label":"RE\n                                                      Schemes of Work"},{"href":"/PrimaryFiveScienceSchemesofWork.html","label":"Science\n                                                      Schemes of Work"},{"href":"/PrimaryFiveSSTSchemesofWork.html","label":"SST\n                                                      Schemes of Work"},{"href":"/PrimaryFiveArtSchemesofWork.html","label":"Art\n                                                      Schemes of Work"},{"href":"/PrimaryFiveEnglishSchemesofWork.html","label":"English\n                                                      Schemes of Work"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              Six</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimarySixICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/PrimarySixMTCLessonNotes.html","label":"MTC\n                                                      Lesson Notes"},{"href":"/PrimarySixRELessonNotes.html","label":"RE\n                                                      Lesson Notes"},{"href":"/PrimarySixScienceLessonNotes.html","label":"Science\n                                                      Lesson Notes"},{"href":"/PrimarySixSSTLessonNotes.html","label":"SST\n                                                      Lesson Notes"},{"href":"/PrimarySixEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimarySixICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/PrimarySixKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/PrimarySixMTCPastPapers.html","label":"MTC\n                                                      Past Papers"},{"href":"/PrimarySixPackagesPastPapers.html","label":"Packages\n                                                      Past Papers"},{"href":"/PrimarySixREPastPapers.html","label":"RE\n                                                      Past Papers"},{"href":"/PrimarySixSciencePastPapers.html","label":"Science\n                                                      Past Papers"},{"href":"/PrimarySixSSTPastPapers.html","label":"SST\n                                                      Past Papers"},{"href":"/PrimarySixEnglishPastPapers.html","label":"English\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimarySixScienceSchemesofWork.html","label":"Science\n                                                      Schemes of Work"},{"href":"/PrimarySixSSTSchemesofWork.html","label":"SST\n                                                      Schemes of Work"},{"href":"/PrimarySixEnglishSchemesofWork.html","label":"English\n                                                      Schemes of Work"},{"href":"/PrimarySixMTCSchemesofWork.html","label":"MTC\n                                                      Schemes of Work"},{"href":"/PrimarySixRESchemesofWork.html","label":"RE\n                                                      Schemes of Work"},{"href":"/PrimarySixArtSchemesofWork.html","label":"Art\n                                                      Schemes of Work"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Primary
                                              Seven</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimarySevenICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/PrimarySevenMTCLessonNotes.html","label":"MTC\n                                                      Lesson Notes"},{"href":"/PrimarySevenRELessonNotes.html","label":"RE\n                                                      Lesson Notes"},{"href":"/PrimarySevenScienceLessonNotes.html","label":"Science\n                                                      Lesson Notes"},{"href":"/PrimarySevenSSTLessonNotes.html","label":"SST\n                                                      Lesson Notes"},{"href":"/PrimarySevenArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/PrimarySevenEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimarySevenSciencePastPapers.html","label":"Science\n                                                      Past Papers"},{"href":"/PrimarySevenSSTPastPapers.html","label":"SST\n                                                      Past Papers"},{"href":"/PrimarySevenEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/PrimarySevenMTCPastPapers.html","label":"MTC\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Schemes Of Work</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/PrimarySevenScienceSchemesofWork.html","label":"Science\n                                                      Schemes of Work"},{"href":"/PrimarySevenSSTSchemesofWork.html","label":"SST\n                                                      Schemes of Work"},{"href":"/PrimarySevenEnglishSchemesofWork.html","label":"English\n                                                      Schemes of Work"},{"href":"/PrimarySevenMTCSchemesofWork.html","label":"MTC\n                                                      Schemes of Work"},{"href":"/PrimarySevenRESchemesofWork.html","label":"RE\n                                                      Schemes of Work"},{"href":"/PrimarySevenArtSchemesofWork.html","label":"Art\n                                                      Schemes of Work"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <hr className={"style1"} />
                  <li>
                    <a className={"waves-effect"} href="#" style={{ paddingTop: "10px", paddingBottom: "10px" }}>{"\n                        "}<i aria-hidden="true" className={"fa fa-calendar-check-o"} />{"\n                        "}<span className={"hide-menu"}><b> Secondary Section</b>{" "}<span className={"fa arrow"} />{" "}</span>{"\n                    "}</a>
                    <ul className={"nav nav-second-level \x63ollapse"}>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Senior
                                              One</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorOneKiswahiliLessonNotes.html","label":"Kiswahili\n                                                      Lesson Notes"},{"href":"/SeniorOneLatinLessonNotes.html","label":"Latin\n                                                      Lesson Notes"},{"href":"/SeniorOneLiteratureLessonNotes.html","label":"Literature\n                                                      Lesson Notes"},{"href":"/SeniorOneLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/SeniorOneMathematicsLessonNotes.html","label":"Mathematics\n                                                      Lesson Notes"},{"href":"/SeniorOnePhysicsLessonNotes.html","label":"Physics\n                                                      Lesson Notes"},{"href":"/SeniorOneSignLanguageLessonNotes.html","label":"Sign\n                                                      Language Lesson Notes"},{"href":"/SeniorOneTDLessonNotes.html","label":"TD\n                                                      Lesson Notes"},{"href":"/SeniorOneAgricultureLessonNotes.html","label":"Agriculture\n                                                      Lesson Notes"},{"href":"/SeniorOneArabicLessonNotes.html","label":"Arabic\n                                                      Lesson Notes"},{"href":"/SeniorOneArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/SeniorOneBiologyLessonNotes.html","label":"Biology\n                                                      Lesson Notes"},{"href":"/SeniorOneChemistryLessonNotes.html","label":"Chemistry\n                                                      Lesson Notes"},{"href":"/SeniorOneCommerceLessonNotes.html","label":"Commerce\n                                                      Lesson Notes"},{"href":"/SeniorOneCRELessonNotes.html","label":"CRE\n                                                      Lesson Notes"},{"href":"/SeniorOneEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"},{"href":"/SeniorOneEntrepreneurshipLessonNotes.html","label":"Entrepreneurship\n                                                      Lesson Notes"},{"href":"/SeniorOneFNLessonNotes.html","label":"FN\n                                                      Lesson Notes"},{"href":"/SeniorOneFrenchLessonNotes.html","label":"French\n                                                      Lesson Notes"},{"href":"/SeniorOneGeographyLessonNotes.html","label":"Geography\n                                                      Lesson Notes"},{"href":"/SeniorOneGermanLessonNotes.html","label":"German\n                                                      Lesson Notes"},{"href":"/SeniorOneHistoryLessonNotes.html","label":"History\n                                                      Lesson Notes"},{"href":"/SeniorOneICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/SeniorOneIRELessonNotes.html","label":"IRE\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorOneCommercePastPapers.html","label":"Commerce\n                                                      Past Papers"},{"href":"/SeniorOneCREPastPapers.html","label":"CRE\n                                                      Past Papers"},{"href":"/SeniorOneEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/SeniorOneEntrepreneurshipPastPapers.html","label":"Entrepreneurship\n                                                      Past Papers"},{"href":"/SeniorOneFNPastPapers.html","label":"FN Past\n                                                      Papers"},{"href":"/SeniorOneFrenchLessonNotes.html","label":"French\n                                                      Lesson Notes"},{"href":"/SeniorOneGeographyPastPapers.html","label":"Geography\n                                                      Past Papers"},{"href":"/SeniorOneHistoryPastPapers.html","label":"History\n                                                      Past Papers"},{"href":"/SeniorOneHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/SeniorOneICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/SeniorOneIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/SeniorOneKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/SeniorOneLiteraturePastPapers.html","label":"Literature\n                                                      Past Papers"},{"href":"/SeniorOneMathematicsPastPapers.html","label":"Mathematics\n                                                      Past Papers"},{"href":"/SeniorOneMusicPastPapers.html","label":"Music\n                                                      Past Papers"},{"href":"/SeniorOnePhysicalEducationPastPapers.html","label":"Physical\n                                                      Education Past Papers"},{"href":"/SeniorOnePhysicsPastPapers.html","label":"Physics\n                                                      Past Papers"},{"href":"/SeniorOneTDPastPapers.html","label":"TD Past\n                                                      Papers"},{"href":"/SeniorOneAgriculturePastPapers.html","label":"Agriculture\n                                                      Past Papers"},{"href":"/SeniorOneAllPastPapers.html","label":"All\n                                                      Past Papers"},{"href":"/SeniorOneArtPastPapers.html","label":"Art\n                                                      Past Papers"},{"href":"/SeniorOneBiologyPastPapers.html","label":"Biology\n                                                      Past Papers"},{"href":"/SeniorOneChemistryPastPapers.html","label":"Chemistry\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Senior
                                              Two</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorTwoLatinLessonNotes.html","label":"Latin\n                                                      Lesson Notes"},{"href":"/SeniorTwoLiteratureLessonNotes.html","label":"Literature\n                                                      Lesson Notes"},{"href":"/SeniorTwoLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/SeniorTwoMathematicsLessonNotes.html","label":"Mathematics\n                                                      Lesson Notes"},{"href":"/SeniorTwoPhysicsLessonNotes.html","label":"Physics\n                                                      Lesson Notes"},{"href":"/SeniorTwoSignLanguageLessonNotes.html","label":"Sign\n                                                      Language Lesson Notes"},{"href":"/SeniorTwoTechnicalDrawingLessonNotes.html","label":"Technical\n                                                      Drawing Lesson Notes"},{"href":"/SeniorTwoTechnologyandDesignLessonNotes.html","label":"Technology\n                                                      and Design Lesson Notes"},{"href":"/SeniorTwoAgricultureLessonNotes.html","label":"Agriculture\n                                                      Lesson Notes"},{"href":"/SeniorTwoArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/SeniorTwoBiologyLessonNotes.html","label":"Biology\n                                                      Lesson Notes"},{"href":"/SeniorTwoChemistryLessonNotes.html","label":"Chemistry\n                                                      Lesson Notes"},{"href":"/SeniorTwoChineseLessonNotes.html","label":"Chinese\n                                                      Lesson Notes"},{"href":"/SeniorTwoCommerceLessonNotes.html","label":"Commerce\n                                                      Lesson Notes"},{"href":"/SeniorTwoCRELessonNotes.html","label":"CRE\n                                                      Lesson Notes"},{"href":"/SeniorTwoEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"},{"href":"/SeniorTwoEntrepreneurshipLessonNotes.html","label":"Entrepreneurship\n                                                      Lesson Notes"},{"href":"/SeniorTwoFNLessonNotes.html","label":"FN\n                                                      Lesson Notes"},{"href":"/SeniorTwoFrenchLessonNotes.html","label":"French\n                                                      Lesson Notes"},{"href":"/SeniorTwoGeographyLessonNotes.html","label":"Geography\n                                                      Lesson Notes"},{"href":"/SeniorTwoGermanLessonNotes.html","label":"German\n                                                      Lesson Notes"},{"href":"/SeniorTwoHistoryLessonNotes.html","label":"History\n                                                      Lesson Notes"},{"href":"/SeniorTwoICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/SeniorTwoIRELessonNotes.html","label":"IRE\n                                                      Lesson Notes"},{"href":"/SeniorTwoKiswahiliLessonNotes.html","label":"Kiswahili\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorTwoGeographyPastPapers.html","label":"Geography\n                                                      Past Papers"},{"href":"/SeniorTwoHistoryPastPapers.html","label":"History\n                                                      Past Papers"},{"href":"/SeniorTwoHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/SeniorTwoICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/SeniorTwoIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/SeniorTwoKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/SeniorTwoLiteraturePastPapers.html","label":"Literature\n                                                      Past Papers"},{"href":"/SeniorTwoLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/SeniorTwoMathematicsPastPapers.html","label":"Mathematics\n                                                      Past Papers"},{"href":"/SeniorTwoMusicPastPapers.html","label":"Music\n                                                      Past Papers"},{"href":"/SeniorTwoPhysicalEducationPastPapers.html","label":"Physical\n                                                      Education Past Papers"},{"href":"/SeniorTwoPhysicsPastPapers.html","label":"Physics\n                                                      Past Papers"},{"href":"/SeniorTwoTDPastPapers.html","label":"Technical\n                                                      Drawing Past Papers"},{"href":"/SeniorTwoAgriculturePastPapers.html","label":"Agriculture\n                                                      Past Papers"},{"href":"/SeniorTwoAllPastPapers.html","label":"All\n                                                      Past Papers"},{"href":"/SeniorTwoArtPastPapers.html","label":"Art\n                                                      Past Papers"},{"href":"/SeniorTwoBiologyPastPapers.html","label":"Biology\n                                                      Past Papers"},{"href":"/SeniorTwoChemistryPastPapers.html","label":"Chemistry\n                                                      Past Papers"},{"href":"/SeniorTwoChinesePastPapers.html","label":"Chinese\n                                                      Past Papers"},{"href":"/SeniorTwoCommercePastPapers.html","label":"Commerce\n                                                      Past Papers"},{"href":"/SeniorTwoCREPastPapers.html","label":"CRE\n                                                      Past Papers"},{"href":"/SeniorTwoEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/SeniorTwoEntrepreneurshipPastPapers.html","label":"Entrepreneurship\n                                                      Past Papers"},{"href":"/SeniorTwoFNPastPapers.html","label":"FN Past\n                                                      Papers"},{"href":"/SeniorTwoFrenchPastPapers.html","label":"French\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Senior
                                              Three</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorThreeFNLessonNotes.html","label":"FN\n                                                      Lesson Notes"},{"href":"/SeniorThreeGeographyLessonNotes.html","label":"Geography\n                                                      Lesson Notes"},{"href":"/SeniorThreeHistoryLessonNotes.html","label":"History\n                                                      Lesson Notes"},{"href":"/SeniorThreeICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/SeniorThreeIRELessonNotes.html","label":"IRE\n                                                      Lesson Notes"},{"href":"/SeniorThreeKiswahiliLessonNotes.html","label":"Kiswahili\n                                                      Lesson Notes"},{"href":"/SeniorThreeLatinLessonNotes.html","label":"Latin\n                                                      Lesson Notes"},{"href":"/SeniorThreeLiteratureLessonNotes.html","label":"Literature\n                                                      Lesson Notes"},{"href":"/SeniorThreeLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/SeniorThreeMathematicsLessonNotes.html","label":"Mathematics\n                                                      Lesson Notes"},{"href":"/SeniorThreePhysicsLessonNotes.html","label":"Physics\n                                                      Lesson Notes"},{"href":"/SeniorThreeTDLessonNotes.html","label":"TD\n                                                      Lesson Notes"},{"href":"/SeniorThreeAgricultureLessonNotes.html","label":"Agriculture\n                                                      Lesson Notes"},{"href":"/SeniorThreeArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/SeniorThreeBiologyLessonNotes.html","label":"Biology\n                                                      Lesson Notes"},{"href":"/SeniorThreeChemistryLessonNotes.html","label":"Chemistry\n                                                      Lesson Notes"},{"href":"/SeniorThreeCommerceLessonNotes.html","label":"Commerce\n                                                      Lesson Notes"},{"href":"/SeniorThreeCRELessonNotes.html","label":"CRE\n                                                      Lesson Notes"},{"href":"/SeniorThreeEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"},{"href":"/SeniorThreeEntrepreneurshipLessonNotes.html","label":"Entrepreneurship\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorThreeAccountsPastPapers.html","label":"Accounts\n                                                      Past Papers"},{"href":"/SeniorThreeAgriculturePastPapers.html","label":"Agriculture\n                                                      Past Papers"},{"href":"/SeniorThreeAllPastPapers.html","label":"All\n                                                      Past Papers"},{"href":"/SeniorThreeArtPastPapers.html","label":"Art\n                                                      Past Papers"},{"href":"/SeniorThreeBiologyPastPapers.html","label":"Biology\n                                                      Past Papers"},{"href":"/SeniorThreeChemistryPastPapers.html","label":"Chemistry\n                                                      Past Papers"},{"href":"/SeniorThreeCommercePastPapers.html","label":"Commerce\n                                                      Past Papers"},{"href":"/SeniorThreeCREPastPapers.html","label":"CRE\n                                                      Past Papers"},{"href":"/SeniorThreeEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/SeniorThreeEntrepreneurshipPastPapers.html","label":"Entrepreneurship\n                                                      Past Papers"},{"href":"/SeniorThreeFNPastPapers.html","label":"FN\n                                                      Past Papers"},{"href":"/SeniorThreeGeographyPastPapers.html","label":"Geography\n                                                      Past Papers"},{"href":"/SeniorThreeHistoryPastPapers.html","label":"History\n                                                      Past Papers"},{"href":"/SeniorThreeHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/SeniorThreeICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/SeniorThreeIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/SeniorThreeKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/SeniorThreeLiteraturePastPapers.html","label":"Literature\n                                                      Past Papers"},{"href":"/SeniorThreeLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/SeniorThreeMathematicsPastPapers.html","label":"Mathematics\n                                                      Past Papers"},{"href":"/SeniorThreePhysicsPastPapers.html","label":"Physics\n                                                      Past Papers"},{"href":"/SeniorThreeTDPastPapers.html","label":"TD\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Senior
                                              Four</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorFourFrenchLessonNotes.html","label":"French\n                                                      Lesson Notes"},{"href":"/SeniorFourGeographyLessonNotes.html","label":"Geography\n                                                      Lesson Notes"},{"href":"/SeniorFourGermanLessonNotes.html","label":"German\n                                                      Lesson Notes"},{"href":"/SeniorFourHistoryLessonNotes.html","label":"History\n                                                      Lesson Notes"},{"href":"/SeniorFourICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/SeniorFourIRELessonNotes.html","label":"IRE\n                                                      Lesson Notes"},{"href":"/SeniorFourKiswahiliLessonNotes.html","label":"Kiswahili\n                                                      Lesson Notes"},{"href":"/SeniorFourLatinLessonNotes.html","label":"Latin\n                                                      Lesson Notes"},{"href":"/SeniorFourLiteratureLessonNotes.html","label":"Literature\n                                                      Lesson Notes"},{"href":"/SeniorFourLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/SeniorFourMathematicsLessonNotes.html","label":"Mathematics\n                                                      Lesson Notes"},{"href":"/SeniorFourPhysicsLessonNotes.html","label":"Physics\n                                                      Lesson Notes"},{"href":"/SeniorFourTechnologyandDesignLessonNotes.html","label":"Technology\n                                                      and Design Lesson Notes"},{"href":"/SeniorFourAgricultureLessonNotes.html","label":"Agriculture\n                                                      Lesson Notes"},{"href":"/SeniorFourArabicLessonNotes.html","label":"Arabic\n                                                      Lesson Notes"},{"href":"/SeniorFourArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/SeniorFourBiologyLessonNotes.html","label":"Biology\n                                                      Lesson Notes"},{"href":"/SeniorFourChemistryLessonNotes.html","label":"Chemistry\n                                                      Lesson Notes"},{"href":"/SeniorFourChineseLessonNotes.html","label":"Chinese\n                                                      Lesson Notes"},{"href":"/SeniorFourCommerceLessonNotes.html","label":"Commerce\n                                                      Lesson Notes"},{"href":"/SeniorFourCRELessonNotes.html","label":"CRE\n                                                      Lesson Notes"},{"href":"/SeniorFourEconomicsLessonNotes.html","label":"Economics\n                                                      Lesson Notes"},{"href":"/SeniorFourEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"},{"href":"/SeniorFourEntrepreneurshipLessonNotes.html","label":"Entrepreneurship\n                                                      Lesson Notes"},{"href":"/SeniorFourFNLessonNotes.html","label":"FN\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorFourHistoryPastPapers.html","label":"History\n                                                      Past Papers"},{"href":"/SeniorFourHolidayPackages.html","label":"Holiday\n                                                      Packages"},{"href":"/SeniorFourICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/SeniorFourIPSPastPapers.html","label":"IPS\n                                                      Past Papers"},{"href":"/SeniorFourIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/SeniorFourKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/SeniorFourLiteraturePastPapers.html","label":"Literature\n                                                      Past Papers"},{"href":"/SeniorFourLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/SeniorFourLumasabaPastPapers.html","label":"Lumasaba\n                                                      Past Papers"},{"href":"/SeniorFourLusogaPastPapers.html","label":"Lusoga\n                                                      Past Papers"},{"href":"/SeniorFourMathematicsPastPapers.html","label":"Mathematics\n                                                      Past Papers"},{"href":"/SeniorFourPhysicsPastPapers.html","label":"Physics\n                                                      Past Papers"},{"href":"/SeniorFourRunyoroPastPapers.html","label":"Runyoro\n                                                      Past Papers"},{"href":"/SeniorFourStudioTechnologyPastPapers.html","label":"Studio\n                                                      Technology Past Papers"},{"href":"/SeniorFourTDPastPapers.html","label":"TD\n                                                      Past Papers"},{"href":"/SeniorFourAccountsPastPapers.html","label":"Accounts\n                                                      Past Papers"},{"href":"/SeniorFourAgriculturePastPapers.html","label":"Agriculture\n                                                      Past Papers"},{"href":"/SeniorFourArabicPastPapers.html","label":"Arabic\n                                                      Past Papers"},{"href":"/SeniorFourArtPastPapers.html","label":"Art\n                                                      Past Papers"},{"href":"/SeniorFourBiologyPastPapers.html","label":"Biology\n                                                      Past Papers"},{"href":"/SeniorFourChemistryPastPapers.html","label":"Chemistry\n                                                      Past Papers"},{"href":"/SeniorFourCommercePastPapers.html","label":"Commerce\n                                                      Past Papers"},{"href":"/SeniorFourCREPastPapers.html","label":"CRE\n                                                      Past Papers"},{"href":"/SeniorFourEconomicsPastPapers.html","label":"Economics\n                                                      Past Papers"},{"href":"/SeniorFourEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/SeniorFourEntreprenuershipPastPapers.html","label":"Entreprenuership\n                                                      Past Papers"},{"href":"/SeniorFourFNPastPapers.html","label":"FN\n                                                      Past Papers"},{"href":"/SeniorFourFrenchPastPapers.html","label":"French\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Senior
                                              Five</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorFiveBiologyLessonNotes.html","label":"Biology\n                                                      Lesson Notes"},{"href":"/SeniorFiveGPLessonNotes.html","label":"GP\n                                                      Lesson Notes"},{"href":"/SeniorFiveHistoryLessonNotes.html","label":"History\n                                                      Lesson Notes"},{"href":"/SeniorFiveLiteratureLessonNotes.html","label":"Literature\n                                                      Lesson Notes"},{"href":"/SeniorFiveMathematicsLessonNotes.html","label":"Mathematics\n                                                      Lesson Notes"},{"href":"/SeniorFivePhysicsLessonNotes.html","label":"Physics\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorFiveBiologyPastPapers.html","label":"Biology\n                                                      Past Papers"},{"href":"/SeniorFiveChemistryPastPapers.html","label":"Chemistry\n                                                      Past Papers"},{"href":"/SeniorFiveDivinityPastPapers.html","label":"Divinity\n                                                      Past Papers"},{"href":"/SeniorFiveEconomicsPastPapers.html","label":"Economics\n                                                      Past Papers"},{"href":"/SeniorFiveEntrepreneurshipPastPapers.html","label":"Entrepreneurship\n                                                      Past Papers"},{"href":"/SeniorFiveGeneralPaperPastPapers.html","label":"General\n                                                      Paper Past Papers"},{"href":"/SeniorFiveGeographyPastPapers.html","label":"Geography\n                                                      Past Papers"},{"href":"/SeniorFiveGermanPastPapers.html","label":"German\n                                                      Past Papers"},{"href":"/SeniorFiveHistoryPastPapers.html","label":"History\n                                                      Past Papers"},{"href":"/SeniorFiveICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/SeniorFiveIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/SeniorFiveKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/SeniorFiveLiteraturePastPapers.html","label":"Literature\n                                                      Past Papers"},{"href":"/SeniorFiveLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/SeniorFiveMathematicsPastPapers.html","label":"Mathematics\n                                                      Past Papers"},{"href":"/SeniorFivePhysicsPastPapers.html","label":"Physics\n                                                      Past Papers"},{"href":"/SeniorFiveAgriculturePastPapers.html","label":"Agriculture\n                                                      Past Papers"},{"href":"/SeniorFiveAllPastPapers.html","label":"All\n                                                      Past Papers"},{"href":"/SeniorFiveArtPastPapers.html","label":"Art\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">
                          <i className={"mdi mdi-clipboard-text fa-fw"} />
                          <span className={"hide-menu"}><b>Senior
                                              Six</b>{" "}<span className={"fa arrow"} />{" "}</span>
                        </a>
                        <ul className={"nav nav-third-level \x63ollapse"}>
                          <li>
                            <a href="#"><b>Lesson Notes</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorSixPhysicsLessonNotes.html","label":"Physics\n                                                      Lesson Notes"},{"href":"/SeniorSixTDLessonNotes.html","label":"TD\n                                                      Lesson Notes"},{"href":"/SeniorSixTechnicalDrawingLessonNotes.html","label":"Technical\n                                                      Drawing Lesson Notes"},{"href":"/SeniorSixAgricultureLessonNotes.html","label":"Agriculture\n                                                      Lesson Notes"},{"href":"/SeniorSixArtLessonNotes.html","label":"Art\n                                                      Lesson Notes"},{"href":"/SeniorSixBiologyLessonNotes.html","label":"Biology\n                                                      Lesson Notes"},{"href":"/SeniorSixChemistryLessonNotes.html","label":"Chemistry\n                                                      Lesson Notes"},{"href":"/SeniorSixDivinityLessonNotes.html","label":"Divinity\n                                                      Lesson Notes"},{"href":"/SeniorSixEconomicsLessonNotes.html","label":"Economics\n                                                      Lesson Notes"},{"href":"/SeniorSixEnglishLessonNotes.html","label":"English\n                                                      Lesson Notes"},{"href":"/SeniorSixEntrepreneurshipLessonNotes.html","label":"Entrepreneurship\n                                                      Lesson Notes"},{"href":"/SeniorSixGeographyLessonNotes.html","label":"Geography\n                                                      Lesson Notes"},{"href":"/SeniorSixGPLessonNotes.html","label":"GP\n                                                      Lesson Notes"},{"href":"/SeniorSixHistoryLessonNotes.html","label":"History\n                                                      Lesson Notes"},{"href":"/SeniorSixICTLessonNotes.html","label":"ICT\n                                                      Lesson Notes"},{"href":"/SeniorSixIPSLessonNotes.html","label":"IPS\n                                                      Lesson Notes"},{"href":"/SeniorSixIRELessonNotes.html","label":"IRE\n                                                      Lesson Notes"},{"href":"/SeniorSixKiswahiliLessonNotes.html","label":"Kiswahili\n                                                      Lesson Notes"},{"href":"/SeniorSixLiteratureLessonNotes.html","label":"Literature\n                                                      Lesson Notes"},{"href":"/SeniorSixLugandaLessonNotes.html","label":"Luganda\n                                                      Lesson Notes"},{"href":"/SeniorSixMathematicsLessonNotes.html","label":"Mathematics\n                                                      Lesson Notes"},{"href":"/SeniorSixMixedLessonNotes.html","label":"Mixed\n                                                      Lesson Notes"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                          <li>
                            <a href="#"><b>Past Papers</b>{" "}<span className={"fa arrow"} /></a>
                            <ul className={"nav nav-third-level \x63ollapse"}>
                              {[{"href":"/SeniorSixICTPastPapers.html","label":"ICT\n                                                      Past Papers"},{"href":"/SeniorSixIREPastPapers.html","label":"IRE\n                                                      Past Papers"},{"href":"/SeniorSixKiswahiliPastPapers.html","label":"Kiswahili\n                                                      Past Papers"},{"href":"/SeniorSixLiteraturePastPapers.html","label":"Literature\n                                                      Past Papers"},{"href":"/SeniorSixLugandaPastPapers.html","label":"Luganda\n                                                      Past Papers"},{"href":"/SeniorSixLumasabaPastPapers.html","label":"Lumasaba\n                                                      Past Papers"},{"href":"/SeniorSixLusogaPastPapers.html","label":"Lusoga\n                                                      Past Papers"},{"href":"/SeniorSixMathematicsPastPapers.html","label":"Mathematics\n                                                      Past Papers"},{"href":"/SeniorSixMusicPastPapers.html","label":"Music\n                                                      Past Papers"},{"href":"/SeniorSixPhysicsPastPapers.html","label":"Physics\n                                                      Past Papers"},{"href":"/SeniorSixTDPastPapers.html","label":"TD Past\n                                                      Papers"},{"href":"/SeniorSixAgriculturePastPapers.html","label":"Agriculture\n                                                      Past Papers"},{"href":"/SeniorSixAllPastPapers.html","label":"All\n                                                      Past Papers"},{"href":"/SeniorSixArabicPastPapers.html","label":"Arabic\n                                                      Past Papers"},{"href":"/SeniorSixArtPastPapers.html","label":"Art\n                                                      Past Papers"},{"href":"/SeniorSixBiologyPastPapers.html","label":"Biology\n                                                      Past Papers"},{"href":"/SeniorSixChemistryPastPapers.html","label":"Chemistry\n                                                      Past Papers"},{"href":"/SeniorSixCommercePastPapers.html","label":"Commerce\n                                                      Past Papers"},{"href":"/SeniorSixDivityPastPapers.html","label":"Divity\n                                                      Past Papers"},{"href":"/SeniorSixEnglishPastPapers.html","label":"English\n                                                      Past Papers"},{"href":"/SeniorSixEntrepreneurshipPastPapers.html","label":"Entrepreneurship\n                                                      Past Papers"},{"href":"/SeniorSixFNPastPapers.html","label":"FN Past\n                                                      Papers"},{"href":"/SeniorSixFrenchPastPapers.html","label":"French\n                                                      Past Papers"},{"href":"/SeniorSixGeographyPastPapers.html","label":"Geography\n                                                      Past Papers"},{"href":"/SeniorSixGermanPastPapers.html","label":"German\n                                                      Past Papers"},{"href":"/SeniorSixGPPastPapers.html","label":"GP Past\n                                                      Papers"},{"href":"/SeniorSixHistoryPastPapers.html","label":"History\n                                                      Past Papers"}].map(item => (
                                <li key={item.href}><a href={item.href}>{item.label}</a></li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ImportedFont>
              </ImportedFont>
            </ul>
            <ImportedFont {...({ color: "green" } as any)}>
              <ImportedFont {...({ color: "#006bb3" } as any)} />
            </ImportedFont>
          </div>
          <div className={"slimScrollBar"} style={{ background: "rgba(0, 0, 0, 0.3)", width: "6px", position: "absolute", top: "0px", opacity: "0.4", display: "block", borderRadius: "7px", zIndex: "99", right: "1px", height: "30px" }} />
          <div className={"slimScrollRail"} style={{ width: "6px", height: "100%", position: "absolute", top: "0px", display: "none", borderRadius: "7px", background: "rgb(51, 51, 51)", opacity: "0.2", zIndex: "90", right: "1px" }} />
        </div>
        <ImportedFont {...({ color: "green" } as any)}>
          <ImportedFont {...({ color: "#006bb3" } as any)} />
        </ImportedFont>
      </div>
      <ImportedFont {...({ color: "green" } as any)}>
        <ImportedFont {...({ color: "#006bb3" } as any)}>
          <div className={"\x63ontainer"}>
            <ImportedMarquee className={"marq"} loop {...({ bgcolor: "tomato", behavior: "slide", direction: "left" } as any)}>
              <strong>
                <em>WELCOME TO FRESH TEACHER'S E-LIBRARY 📚</em>
              </strong>
            </ImportedMarquee>
            <div className={"page-wrapper"}>
              <h4 style={{ textAlign: "center" }}>Choose One Class From the Shelf to Continue:</h4>
              {[[["/baby.html","/site-assets/38b562de7a703721.jpg"],["/middle.html","/site-assets/2678aa3269d5d22e.jpg"],["/top.html","/site-assets/dd24d997e9aee484.jpg"],["/p1.html","/site-assets/0271635f1512f556.jpg"],["/p2.html","/site-assets/5527700303a747d5.jpg"]],[["/p3.html","/site-assets/c2900bc4d7e37bc5.jpg"],["/p4.html","/site-assets/da6221f3c776f0f8.jpg"],["/p5.html","/site-assets/c86e0acf9527203d.jpg"],["/p6.html","/site-assets/54979b9228e9fc98.jpg"],["/p7.html","/site-assets/0454f10b5fb7c5b9.jpg"]],[["/s1.html","/site-assets/61675a875aa48282.jpg"],["/s2.html","/site-assets/9ea5ba1229bdd3ef.jpg"],["/s3.html","/site-assets/34f4506bd2d50838.jpg"],["/s4.html","/site-assets/b273348d381d8742.jpg"],["/s5.html","/site-assets/02b5601e14c8cb37.jpg"]],[["/s6.html","/site-assets/591680e28cf5e2a0.jpg"],["",""],["",""],["",""],["",""]]].map((shelf, shelfIndex) => (
                renderShelf(shelf, shelfIndex)
              ))}
            </div>
            <br />
            <audio id="audiocracker" />
            <div className={"hide"} id="africavotes-chat">
              <div className={"header-chat"}>
                <div className={"head-home"}>
                  <div className={"info-avatar"}>
                    <img src={adminPhoto.url} />
                  </div>
                  <p>
                    <span className={"africavotes-name"}>Fresh Teacher</span>
                    <br />
                    <small>online </small>
                  </p>
                </div>
                <div className={"get-new hide"}>
                  <div id="get-label" />
                  <div id="get-nama" />
                </div>
              </div>
              <div className={"home-chat"} />
              <div className={"\x73tart-chat"}>
                <div className={"africavotes-chat-body"}>
                  <div className={"dAbFpq"}>
                    <div className={"eJJEeC"} style={{ opacity: "0" }}>
                      <div className={"hFENyl"}>
                        <div className={"ixsrax"} />
                        <div className={"dRvxoz"} />
                        <div className={"kXBtNt"} />
                      </div>
                    </div>
                    <div className={"kAZgZq"} style={{ opacity: "1" }}>
                      <div className={"iSpIQi"} id="greeting">Hello, good evening! 🌙</div>
                    </div>
                  </div>
                </div>
                <div className={"blanter-msg"}> <textarea id="chat-input" maxLength={120} placeholder="Message" /> <a id="send-it"><svg viewBox="0 0 448 448">{"\n                            "}<path d="M.213 32L0 181.333 320 224 0 266.667.213 416 448 224z" />{"\n                        "}</svg></a> </div>
              </div>
              <div id="get-number" />
              <a className={"close-chat"}>×</a>
            </div>
            <a className={"africaVotesChat"} title="Show Chat"><svg width="20" viewBox="0 0 24 24">{"\n                "}<defs />{"\n                "}<path fill="#eceff1" d="M20.5 3.4A12.1 12.1 0 0012 0 12 12 0 001.7 17.8L0 24l6.3-1.7c2.8 1.5 5 1.4 5.8 1.5a12 12 0 008.4-20.3z" />{"\n                "}<path fill="#4caf50" d="M12 21.8c-3.1 0-5.2-1.6-5.4-1.6l-3.7 1 1-3.7-.3-.4A9.9 9.9 0 012.1 12a10 10 0 0117-7 9.9 9.9 0 01-7 16.9z" />{"\n                "}<path fill="#fafafa" d="M17.5 14.3c-.3 0-1.8-.8-2-.9-.7-.2-.5 0-1.7 1.3-.1.2-.3.2-.6.1s-1.3-.5-2.4-1.5a9 9 0 01-1.7-2c-.3-.6.4-.6 1-1.7l-.1-.5-1-2.2c-.2-.6-.4-.5-.6-.5-.6 0-1 0-1.4.3-1.6 1.8-1.2 3.6.2 5.6 2.7 3.5 4.2 4.2 6.8 5 .7.3 1.4.3 1.9.2.6 0 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" />{"\n            "}</svg> Chat</a>
          </div>
        </ImportedFont>
      </ImportedFont>
      <ins className={"adsbygoogle adsbygoogle-noablate"} style={{ display: "none" }}>
        <div id="aswift_0_host" style={{ borderWidth: "medium", borderStyle: "none", borderColor: "currentcolor", borderImage: "none", height: "0px", width: "0px", margin: "0px", padding: "0px", position: "relative", visibility: "visible", backgroundColor: "transparent", display: "inline-block" } as CSSProperties} />
      </ins>
    </div>
  );
}

function ImportedNav() {
  return (
    <nav className={"navbar navbar-default navbar-static-top \x6d-b-0"}>
      <div className={"navbar-header"}>
        <ul className={"nav navbar-top-links navbar-left"}>
          <li>
            <a className={"open-close waves-effect waves-light"}>
              <i className={"ti-menu"} />
            </a>
          </li>
          <li className={"dropdown"}>
            <a href="#">
              <i className={"mdi mdi-video"} />
              <div className={"notify"}> <span className={"heartbit"} /> <span className={"point"} /> </div>
            </a>
            <ul className={"dropdown-menu mailbox animated bounceInDown"}>
              <li>
                <a href="/movie.html">{"\n                                "}</a>
                <div>
                  <a href="/movie.html">
                    <p>
                      <strong>Fresh TV 📺</strong>
                    </p>
                    <p />
                    <span className={"pull-right \x74ext-muted"} />
                  </a>
                  <a href="/movie.html">
                    <b>Start
                                                        Watching</b>
                    <i className={"mdi mdi-play"} />
                    <p />
                  </a>
                  <div className={"progress progress-striped active"}>
                    <div className={"progress-bar progress-bar-danger"} role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} style={{ width: "100%" }}>
                      <span className={"\x73r-only"} />
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
          <li className={"dropdown"}>
            <a href="#">
              <i className={"mdi mdi-microphone"} />
              <div className={"notify"}>
                <span className={"heartbit"} />
                <span className={"point"} />
              </div>
            </a>
            <ul className={"dropdown-menu dropdown-tasks animated slideInDown"}>
              <li>
                <a href="https://freshradio.vercel.app">{"\n                        "}</a>
                <div>
                  <a href="https://freshradio.vercel.app">
                    <p> <strong>Fresh Radio 📻</strong> <span className={"pull-right \x74ext-muted"}>{"\n                                    "}</span></p>
                    <p />
                  </a>
                  <a href="https://freshradio.vercel.app">
                    <b>Start Listening</b>
                    <i className={"mdi mdi-play"} />
                  </a>
                  <p />
                  <div className={"progress progress-striped active"}>
                    <div className={"progress-bar progress-bar-success"} role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} style={{ width: "100%" }}>
                      <span className={"\x73r-only"}>100% Complete (success)</span>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
          <li className={"mega-dropdown"}>
            <a href="#"><span className={"hidden-xs"} />{" "}<i className={"mdi mdi-trophy"} />{"\n                "}<div className={"notify"}><span className={"heartbit"} /><span className={"point"} /></div>{"\n\n                "}</a>
            <ul className={"dropdown-menu mega-dropdown-menu animated bounceInLeft"}>
              <a href="#">{"\n                    "}</a>
              <li className={"\x63ol-sm-3 active"}>
                <a href="#">{"\n                        "}</a>
                <ul className={"in"}>
                  <a href="#">
                    <li className={"dropdown-header"}>
                      <b>FRESH GAMES 🎮</b>
                    </li>
                  </a>
                  <center>
                    <a href="#">
                      <br />
                    </a>
                    <button className={"btn btn-danger heartbeat"}>
                      <a href="#" />
                      <a href="/games">PLAY NOW</a>
                    </button>
                    <a href="/games">{"\n            "}</a>
                    <br />
                  </center>
                  <br />
                  <li>
                    <a className={"active"} href=""> Hey teachers! Ever heard the saying <b><i>'Work without play makes Jack a dull boy'</i></b>?
                    Well, we've got you covered! Rest assured, most of our games are designed basing on the curriculum to
                    stimulate young minds, ensuring that every moment spent playing is a moment of intellectual growth and
                    discovery. 💡</a>
                    <br />
                    <a className={"active"} href="">And hey, kids! Remember, <b><i>'Play without work makes Jack a mere toy'</i></b>. So, try to
                    balance the boat. The games are not just fun, they're packed with valuable learning too. Let's play,
                    learn, and grow together! 🚀</a>
                  </li>
                  <center>
                    <br />
                    <button className={"btn btn-danger heartbeat"}>
                      <a href="/games">PLAY
                        NOW</a>
                    </button>
                    <br />
                  </center>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        <ul className={"nav navbar-top-links navbar-right pull-right"}>
          <li className={"dropdown"}>
            <a href="#">
              <img src={adminPhoto.url} alt="user-img" width="36" className={"img-circle"} />
              <b className={"hidden-xs"} />
            </a>
            <ul className={"dropdown-menu dropdown-user animated flipInY"}>
              <li>
                <div className={"dw-user-box"}>
                  <div className={"u-img"}>
                    <img src={adminPhoto.url} alt="user" />
                  </div>
                  <div {...({ classname: "u-text" } as any)}>
                    <h4>Admin's Contact:</h4>
                    <b>
                      <p className={"\x74ext-muted"}>Mutumba Jesse Paul</p>
                      <p {...({ classname: "text-muted" } as any)}><a href="tel:+256750687790">+256750687790</a> / <a href="tel:+256786812837">+256786812837</a></p>
                      <p {...({ classname: "text-muted" } as any)}>
                        <a href="mailto:freshteacheruganda256@gmail.com">freshteacheruganda256@gmail.com</a>
                      </p>
                    </b>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function renderShelf(shelf: string[][], shelfIndex: number) {
  return <span key={shelfIndex} style={{ display: "contents" }}>
    <div className="bookshelf"><div className="covers">
      {shelf.map(([href, src], index) => <div className="thumb book-1" key={index}>
        <a href={href}>{src ? <img src={src} /> : null}</a>
      </div>)}
    </div><img className="shelf-img" src="/site-assets/36bc42cbc31e7907.png" /></div>
    {shelfIndex < 3 ? <br /> : null}
  </span>;
}
