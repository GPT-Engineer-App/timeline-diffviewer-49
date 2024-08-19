import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const RewriteForm = ({ inputValue, onInputChange, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="p-4 bg-white border-t">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter a prompt to rewrite the content..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rewriting...
            </>
          ) : (
            'Rewrite'
          )}
        </Button>
      </div>
    </form>
  );
};

export default RewriteForm;