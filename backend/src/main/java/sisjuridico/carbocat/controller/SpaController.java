package sisjuridico.carbocat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/{path:^(?!api$)[^.]*}",
            "/{first:^(?!api$)[^.]*}/{second:[^.]*}"
    })
    String index() {
        return "forward:/index.html";
    }
}
