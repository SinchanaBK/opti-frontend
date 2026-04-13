"use client";
import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const LIMIT = 3;
const DELAY = 5000;
type ToasterToast = ToastProps & { id: string; title?: React.ReactNode; description?: React.ReactNode; action?: ToastActionElement; };
type Action = { type:"ADD"; toast:ToasterToast } | { type:"REMOVE"; id?:string };
let count = 0;
function genId() { return String(++count); }
const listeners: ((s: {toasts:ToasterToast[]}) => void)[] = [];
let state: {toasts:ToasterToast[]} = { toasts:[] };
function dispatch(action: Action) {
  switch(action.type) {
    case "ADD":    state = { toasts:[action.toast,...state.toasts].slice(0,LIMIT) }; break;
    case "REMOVE": state = { toasts: action.id ? state.toasts.filter(t=>t.id!==action.id) : [] }; break;
  }
  listeners.forEach(l=>l(state));
}
export function toast(props: Omit<ToasterToast,"id">) {
  const id = genId();
  const timeoutId = setTimeout(()=>dispatch({type:"REMOVE",id}), DELAY);
  dispatch({ type:"ADD", toast:{ ...props, id, open:true, onOpenChange:(open)=>{ if(!open){ clearTimeout(timeoutId); dispatch({type:"REMOVE",id}); } } } });
  return { id, dismiss:()=>dispatch({type:"REMOVE",id}) };
}
export function useToast() {
  const [s, setS] = React.useState(state);
  React.useEffect(()=>{ listeners.push(setS); return()=>{ const i=listeners.indexOf(setS); if(i>-1)listeners.splice(i,1); }; },[]);
  return { ...s, toast, dismiss:(id?:string)=>dispatch({type:"REMOVE",id}) };
}
export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({id,title,description,action,...props})=>(
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
