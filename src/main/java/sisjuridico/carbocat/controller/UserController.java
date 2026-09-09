package sisjuridico.carbocat.controller;

@RestController
@RequestMapping("/users")
@AllArgsContructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<list<UserResponseDTO>> findAll(@RequestParam(required = false) String name){
        if(name != null && !name.isBlank()) {
            return ResponseEntity.ok(userService.findByUserName(name));
        }
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findByID(@PathVariable Long id){
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserReponseDTO> save(@RequestBody @Valid UserCreateDTO dto){
        UserResponseDTO savedUser = userService.save(dto);

        URI location = URI.create("/users/" + savedUser.getId());

        return ResponseEntity.created(location).body(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update (@PathVariabel Long id; @RequestBody @Valid UserCreateDTO dto){
        return ResponseEntity.ok(userService.update(id, dto));
    }
}